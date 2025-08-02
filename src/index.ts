#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

interface NipApiResponse {
  result: {
    subject: {
      name: string;
      nip: string;
      statusVat: 'Czynny' | 'Zwolniony' | 'Niezarejestrowany';
      regon?: string;
      pesel?: string;
      krs?: string;
      residenceAddress?: string;
      workingAddress?: string;
      registrationLegalDate?: string;
      registrationDenialDate?: string;
      removalDate?: string;
      accountNumbers?: string[];
      hasVirtualAccounts?: boolean;
    } | null;
    requestId: string;
    requestDateTime: string;
  };
}

class NipCheckerServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'nip-checker',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'check_nip',
            description: 'Check Polish NIP (Tax Identification Number) in the Ministry of Finance VAT taxpayer database',
            inputSchema: {
              type: 'object',
              properties: {
                nip: {
                  type: 'string',
                  description: 'Polish NIP number (10 digits, hyphens optional)',
                  pattern: '^[0-9-]{10,13}$'
                },
                date: {
                  type: 'string',
                  description: 'Date for verification (YYYY-MM-DD format, optional - defaults to today)',
                  pattern: '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
                }
              },
              required: ['nip']
            }
          },          {
            name: 'check_nip_bank_account',
            description: 'Verify if a bank account is assigned to a specific NIP',
            inputSchema: {
              type: 'object',
              properties: {
                nip: {
                  type: 'string',
                  description: 'Polish NIP number (10 digits)',
                  pattern: '^[0-9-]{10,13}$'
                },
                bankAccount: {
                  type: 'string',
                  description: 'Bank account number (26 digits)',
                  pattern: '^[0-9]{26}$'
                },
                date: {
                  type: 'string',
                  description: 'Date for verification (YYYY-MM-DD format, optional)',
                  pattern: '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
                }
              },
              required: ['nip', 'bankAccount']
            }
          }
        ]
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case 'check_nip':
          return await this.checkNip(args as { nip: string; date?: string });
        
        case 'check_nip_bank_account':
          return await this.checkNipBankAccount(args as { 
            nip: string; 
            bankAccount: string; 
            date?: string 
          });

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });
  }
  private normalizeNip(nip: string): string {
    return nip.replace(/[-\s]/g, '');
  }

  private getCurrentDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  private formatVatStatus(status: string): string {
    const statusMap: Record<string, string> = {
      'Czynny': 'Active',
      'Zwolniony': 'Exempt', 
      'Niezarejestrowany': 'Unregistered'
    };
    return `${status} (${statusMap[status] || status})`;
  }

  private async checkNip(args: { nip: string; date?: string }) {
    try {
      const normalizedNip = this.normalizeNip(args.nip);
      const date = args.date || this.getCurrentDate();
      
      if (normalizedNip.length !== 10) {
        throw new Error('NIP must be exactly 10 digits');
      }

      const url = `https://wl-api.mf.gov.pl/api/search/nip/${normalizedNip}?date=${date}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'NIP-Checker-MCP/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }
      const data: NipApiResponse = await response.json();
      
      if (!data.result.subject) {
        return {
          content: [
            {
              type: 'text',
              text: `❌ NIP ${normalizedNip} not found in VAT registry\n\nRequest ID: ${data.result.requestId}\nDate: ${data.result.requestDateTime}`
            }
          ]
        };
      }

      const subject = data.result.subject;
      const bankAccounts = subject.accountNumbers?.join(', ') || 'None registered';
      
      const result = `✅ NIP Verification Results

**NIP**: ${subject.nip}
**Company**: ${subject.name}
**VAT Status**: ${this.formatVatStatus(subject.statusVat)}
**Address**: ${subject.residenceAddress || 'Not provided'}
**Working Address**: ${subject.workingAddress || 'Same as residence'}
**Registration Date**: ${subject.registrationLegalDate || 'Not available'}
**Bank Accounts**: ${bankAccounts}
**REGON**: ${subject.regon || 'Not provided'}
**KRS**: ${subject.krs || 'Not provided'}
**Virtual Accounts**: ${subject.hasVirtualAccounts ? 'Yes' : 'No'}

**Request Details**:
- Request ID: ${data.result.requestId}
- Query Date: ${data.result.requestDateTime}`;

      return {
        content: [
          {
            type: 'text',
            text: result
          }
        ]
      };

    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Error checking NIP: ${error instanceof Error ? error.message : 'Unknown error'}`
          }
        ],
        isError: true
      };
    }
  }
  private async checkNipBankAccount(args: { nip: string; bankAccount: string; date?: string }) {
    try {
      const normalizedNip = this.normalizeNip(args.nip);
      const date = args.date || this.getCurrentDate();
      
      if (normalizedNip.length !== 10) {
        throw new Error('NIP must be exactly 10 digits');
      }

      if (args.bankAccount.length !== 26) {
        throw new Error('Bank account must be exactly 26 digits');
      }

      const url = `https://wl-api.mf.gov.pl/api/check/nip/${normalizedNip}/bank-account/${args.bankAccount}?date=${date}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'NIP-Checker-MCP/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      const isAssigned = data.result.accountAssigned === 'TAK';
      const status = isAssigned ? '✅ VERIFIED' : '❌ NOT VERIFIED';
      
      const result = `${status} Bank Account Assignment

**NIP**: ${normalizedNip}
**Bank Account**: ${args.bankAccount}
**Assignment Status**: ${data.result.accountAssigned} (${isAssigned ? 'Account is assigned to this NIP' : 'Account is NOT assigned to this NIP'})
**Verification Date**: ${date}

**Request Details**:
- Request ID: ${data.result.requestId}
- Query Time: ${data.result.requestDateTime}`;

      return {
        content: [
          {
            type: 'text',
            text: result
          }
        ]
      };

    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Error checking NIP-Bank account: ${error instanceof Error ? error.message : 'Unknown error'}`
          }
        ],
        isError: true
      };
    }
  }
  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('NIP Checker MCP server running on stdio');
  }
}

const server = new NipCheckerServer();
server.run().catch(console.error);