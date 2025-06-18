declare module 'dns2' {
  export interface DNSRecord {
    name: string;
    type: string;
    ttl: number;
    data: string;
  }

  export function lookup(domain: string, type: string): Promise<DNSRecord[]>;
} 