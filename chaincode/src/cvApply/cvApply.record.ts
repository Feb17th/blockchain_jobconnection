/*
  SPDX-License-Identifier: Apache-2.0
*/

import { Object, Property } from 'fabric-contract-api';

@Object()
export class CVApply {
  @Property()
  public cvApplyId: string = '';

  @Property()
  public userId: string = '';

  @Property()
  public jobId: string = '';

  @Property()
  public linkCV: string = '';

  @Property()
  public status: string = '';

  @Property()
  public dateApplied: string = '';
}