/*
  SPDX-License-Identifier: Apache-2.0
*/

import { Object, Property } from 'fabric-contract-api';

@Object()
export class Interview {
    @Property()
    public interviewId: string = '';

    @Property()
    public cvApplyId: string = '';

    @Property()
    public linkMeeting: string = '';

    @Property()
    public dateInterview: string = '';
}