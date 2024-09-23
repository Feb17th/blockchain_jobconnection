/*
 * SPDX-License-Identifier: Apache-2.0
 */
// Deterministic JSON.stringify()
import {Context, Contract, Info, Returns, Transaction} from 'fabric-contract-api';
import stringify from 'json-stringify-deterministic';
import sortKeysRecursive from 'sort-keys-recursive';
import {Interview} from './interview.record'

@Info({title: 'InterviewContract', description: 'Smart contract for interview'})
export class InterviewContract extends Contract {




    //Create Interview
    @Transaction()
    public async CreateInterview(ctx: Context, interviewId: string, cvApplyId: string, linkMeeting: string, dateInterview: string): Promise<void> {
        const interviewKey = `interview:${interviewId}`;
        const exists = await this.InterviewExists(ctx, interviewId);
        if(exists) {
            throw new Error(`The interview ${interviewId} already exists`);
        }

        const interview = {
            InterviewId: interviewId,
            CvApplyId: cvApplyId,
            LinkMeeting: linkMeeting,
            DateInterview: dateInterview
        }
        await ctx.stub.putState(interviewKey, Buffer.from(stringify(sortKeysRecursive(interview))));
    }

    @Transaction()
    public async UpdateInterview(ctx: Context, interviewId: string, cvApplyId: string, linkMeeting: string, dateInterview: string): Promise<void> {
        const interviewKey = `interview:${interviewId}`;
        const exists = await this.InterviewExists(ctx, interviewId);
        if (!exists) {
            throw new Error(`The interview ${interviewId} does not exist`);
        }

        // overwriting original interview with new cvApply
        const updateInterview = {
            InterviewId: interviewId,
            CvApplyId: cvApplyId,
            LinkMeeting: linkMeeting,
            DateInterview: dateInterview
        }
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        await ctx.stub.putState(interviewKey, Buffer.from(stringify(sortKeysRecursive(updateInterview))));
    }

    // Get All Interview returns all interview found in the world state.
    @Transaction(false)
    @Returns('string')
    public async GetAllInterview(ctx: Context): Promise<string> {
        const allResults = [];
        const iterator = await ctx.stub.getStateByRange('intereview:', 'interview:zzzzzzzzzzzzzzzzzzzz');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue) as Interview;
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
    @Returns('boolean')
    public async InterviewExists(ctx: Context, interviewId: string): Promise<boolean> {
        const interviewKey = `interview:${interviewId}`;
        const assetJSON = await ctx.stub.getState(interviewKey);
        return assetJSON.length > 0;
    }
}