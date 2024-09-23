/*
 * SPDX-License-Identifier: Apache-2.0
 */
// Deterministic JSON.stringify()
import {Context, Contract, Info, Returns, Transaction} from 'fabric-contract-api';
import stringify from 'json-stringify-deterministic';
import sortKeysRecursive from 'sort-keys-recursive';
import {CVApply} from './cvApply.record'

@Info({title: 'CVApplyContract', description: 'Smart contract for cv apply'})
export class CVApplyContract extends Contract {




    // Create CVApply
    @Transaction()
    public async CreateCVApply(ctx: Context, cvApplyId: string, userId: string, jobId: string, linkCV: string, status: string, dateApplied: string): Promise<void> {
        const cvApplyKey = `cvApply:${cvApplyId}`;
        const exists = await this.CVApplyExists(ctx, cvApplyId);
        if(exists) {
            throw new Error(`The cv ${cvApplyId} already exists`);
        }

        const cvApply = {
            CvApplyId: cvApplyId,
            UserId: userId,
            JobId: jobId,
            LinkCV: linkCV,
            Status: status,
            DateApplied: dateApplied
        }
        await ctx.stub.putState(cvApplyKey, Buffer.from(stringify(sortKeysRecursive(cvApply))));
    }

    @Transaction()
    public async UpdateCVApply(ctx: Context, cvApplyId: string, userId: string, jobId: string, linkCV: string, status: string, dateApplied: string): Promise<void> {
        const cvApplyKey = `cvApply:${cvApplyId}`;
        const exists = await this.CVApplyExists(ctx, cvApplyId);
        if (!exists) {
            throw new Error(`The user ${cvApplyId} does not exist`);
        }

        // overwriting original cvApply with new cvApply
        const updateCVApply = {
            CvApplyId: cvApplyId,
            UserId: userId,
            JobId: jobId,
            LinkCV: linkCV,
            Status: status,
            DateApplied: dateApplied
        }
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        await ctx.stub.putState(cvApplyKey, Buffer.from(stringify(sortKeysRecursive(updateCVApply))));
    }

    // Get All CV Apply returns all cv apply found in the world state.
    @Transaction(false)
    @Returns('string')
    public async GetAllCVApply(ctx: Context): Promise<string> {
        const allResults = [];
        const iterator = await ctx.stub.getStateByRange('cvApply:', 'cvApply:zzzzzzzzzzzzzzzzzzzz');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue) as CVApply;
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push(record);
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }

    @Transaction(false)
    public async ReadCVApply(ctx: Context, id: string): Promise<string> {
        const cvApplyKey = `cvApply:${id}`;
        const assetJSON = await ctx.stub.getState(cvApplyKey);
        if (assetJSON.length === 0) {
            throw new Error(`The cv apply ${id} does not exist`);
        }
        return assetJSON.toString();
    }

    @Transaction(false)
    @Returns('boolean')
    public async CVApplyExists(ctx: Context, id: string): Promise<boolean> {
        const cvApplyKey = `cvApply:${id}`;
        const assetJSON = await ctx.stub.getState(cvApplyKey);
        return assetJSON.length > 0;
    }

}