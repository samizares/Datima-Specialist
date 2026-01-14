declare module "@prisma/adapter-pg" {
  import { Pool } from "pg";

  export interface SqlDriverAdapterFactory {
    connect: (...args: any[]) => Promise<any> | any;
    provider: any;
    adapterName: any;
  }

  export class PrismaPg implements SqlDriverAdapterFactory {
    provider: any;
    adapterName: any;
    constructor(pool: Pool | string);
    connect(...args: any[]): Promise<any> | any;
  }

  export default PrismaPg;
}
