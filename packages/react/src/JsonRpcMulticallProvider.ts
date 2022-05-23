import type { Signer } from '@ethersproject/abstract-signer';
import { Contract } from '@ethersproject/contracts';
import { Logger } from '@ethersproject/logger';
import { BaseProvider, BlockTag, Network, TransactionRequest } from '@ethersproject/providers';

import Multicall from './Multicall.json';

const logger = new Logger('0.1.0');

interface HasSigner {
  getSigner(_addressOrIndex?: string | number): Signer;
}

type BatchCallItem = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  request: { target: string; callData: any };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resolve: (_result: any) => void;
  reject: (_error: Error) => void;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function hasSigner(obj: any): obj is HasSigner {
  return (obj as unknown as HasSigner).getSigner !== undefined;
}

type CallParams = { transaction: TransactionRequest; blockTag?: BlockTag };

// Multicall3 is deployed at the same create2 address on basically every chain
// https://github.com/mds1/multicall
const multicall3Address = '0xcA11bde05977b3631167028862bE2a173976CA11';

export class JsonRpcMulticallProvider extends BaseProvider {
  readonly parent: BaseProvider;

  _pendingBatchAggregator?: NodeJS.Timer | null;
  _pendingBatch?: Array<BatchCallItem> | null;

  constructor(provider: BaseProvider) {
    super(provider.getNetwork());

    this.parent = provider;
  }

  getSigner(addressOrIndex?: string | number): Signer {
    if (!hasSigner(this.parent)) {
      return logger.throwError('Parent provider does not support getSigner', Logger.errors.NOT_IMPLEMENTED, {
        parent: this.parent,
      });
    }

    return this.parent.getSigner(addressOrIndex);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async perform(method: string, params: any): Promise<any> {
    if (method === 'call') {
      const reqParams = params as CallParams;

      const target = reqParams.transaction.to;
      const callData = reqParams.transaction.data;

      // If there is no call data or unknown multicall contract, just passthrough to parent
      if (!target || !callData) {
        return this.parent.perform(method, params);
      }

      if (!this._pendingBatch) {
        this._pendingBatch = [];
      }

      const newCall: BatchCallItem = { request: { target, callData }, resolve: null!, reject: null! };

      const promise = new Promise((resolve, reject) => {
        newCall.resolve = resolve;
        newCall.reject = reject;
      });

      this._pendingBatch.push(newCall);

      if (!this._pendingBatchAggregator) {
        const provider = this.parent;

        this._pendingBatchAggregator = setTimeout(async () => {
          const batch = this._pendingBatch;
          if (!batch) {
            return;
          }

          this._pendingBatch = null;
          this._pendingBatchAggregator = null;

          const multicall = new Contract(multicall3Address, Multicall.abi, provider);

          // returns [blockNumber, call results], so results are at index 1
          const multicallResult = await multicall.aggregate(batch.map(i => i.request));

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          multicallResult[1].map((result: any, i: number) => batch[i].resolve(result));

          this._pendingBatch = null;
          this._pendingBatchAggregator = null;
        }, 10);
      }

      return promise;
    } else {
      return this.parent.perform(method, params);
    }
  }

  detectNetwork(): Promise<Network> {
    return this.parent.detectNetwork();
  }
}
