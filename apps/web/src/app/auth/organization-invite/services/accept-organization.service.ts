import { Injectable } from "@angular/core";
import { firstValueFrom } from "rxjs";

import {
  GlobalState,
  GlobalStateProvider,
  KeyDefinition,
  ORGANIZATION_INVITE_DISK,
} from "@bitwarden/common/platform/state";

const ORGANIZATION_INVITE = new KeyDefinition<any>(ORGANIZATION_INVITE_DISK, "organizationInvite", {
  deserializer: (invite) => invite,
});

@Injectable()
export class AcceptOrganizationInviteService {
  private organizationInvitationState: GlobalState<any>;
  constructor(private readonly globalStateProvider: GlobalStateProvider) {
    this.organizationInvitationState = this.globalStateProvider.get(ORGANIZATION_INVITE);
  }

  async getOrganizationInvite(): Promise<any> {
    return await firstValueFrom(this.organizationInvitationState.state$);
  }
  // TODO: add type
  async setOrganizationInvitation(invite: any): Promise<void> {
    return await this.organizationInvitationState.update(() => invite);
  }

  async clearOrganizationInvitation(): Promise<void> {
    return await this.organizationInvitationState.update(() => null);
  }
}
