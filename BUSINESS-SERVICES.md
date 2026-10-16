# CRM, newsletters and customer operations

Research and integration plan, 16 October 2026. These services are candidates, not connected capabilities. No contacts imported, accounts provisioned, or messages sent.

## Initial shortlist

| Capability | Candidate | Boundary and license evidence |
| --- | --- | --- |
| CRM: contacts, companies and deals | Twenty | Separate service and database; API/webhook integration. Mostly AGPL-3.0 with an application exception; marked Enterprise files have commercial terms and specified packages are MIT. Inspect the selected release before packaging. |
| Newsletters and subscriber lists | listmonk | Go binary with PostgreSQL; HTTP API and external SMTP delivery. AGPL-3.0. Owns subscriptions, suppression and campaign delivery state. |
| Customer support and shared inbox | Chatwoot Community | Separate service; MIT outside enterprise/ and separately licensed third-party components. Later phase. |
| Site and campaign analytics | Umami | Separate analytics service, MIT. Later phase. |
| Complex marketing journeys | Mautic | GPL-3.0-or-later; optional alternative when listmonk plus bounded connector jobs cannot meet a concrete requirement. Do not deploy two campaign engines by default. |
| Connector automation | Activepieces Community core | Existing architecture default; executes bounded connector jobs. |

## Data ownership

Convex remains authoritative for Aegntic projects, creative approvals, operation mappings and UI projections. Twenty owns CRM domain records; listmonk owns mailing subscriptions and delivery/suppression state. Those domain stores are not replacements for the application database. Store provider IDs and minimal projections in Convex; avoid bidirectional ownership of the same field.

Pi Durable owns the Aegntic workflow and recovery. Activepieces owns only explicitly delegated connector jobs; listmonk owns campaign delivery after acceptance. Persist an operation ID and external receipt. After a lost response, reconcile the external record before retrying. Do not assume all vendor APIs accept idempotency keys.

## First integration slice

1. Waitlist form captures an explicit newsletter choice, source and timestamp; it creates a Convex application record.
2. A bounded adapter upserts the CRM contact and maps its external ID. Use a stable external key, with duplicate and webhook replay checks.
3. Only newsletter opt-ins enter listmonk; membership and opt-out state are read back from the newsletter authority. A CRM lead alone is not an email subscription.
4. Agents prepare campaign copy, graphics, audience preview and a test render. Delivery requires a reviewed campaign revision, explicit audience and sender configuration.
5. Provider bounce/complaint/unsubscribe events update suppression first; workflows must never recreate a suppressed subscription automatically. Keep event IDs for deduplication and handle deletion requests across mapped services.
6. Qualify with synthetic contacts, a local SMTP sink and disabled outbound networking before enabling real delivery.

Credentials belong in server-side secret configuration. CRM contacts and campaign audiences must not enter public build logs or general coding-worker workspaces.

## Hosting and costs

These applications require their supported server/database environments; they are not automatically celld/Workers-compatible. Keep them off the agent execution security boundary. Preserve upstream runtime requirements and lockfiles. The earlier $15–30 agent-server estimate does not include this entire stack. Size a separate business-services host after measuring the selected applications. SMTP delivery, domains, storage and backups can cost money even when application software is free.

Start with Twenty and listmonk; add support/analytics when used. Hosted Convex remains the preferred initial application backend. No paid infrastructure or sending service has been provisioned.

## Sources

Checked 16 October 2026; branch-head research is not a deployment pin. Pin releases and retain their complete notices before implementation.

- https://github.com/twentyhq/twenty and https://github.com/twentyhq/twenty/blob/main/LICENSE
- https://github.com/knadh/listmonk and https://listmonk.app/docs/ and https://github.com/knadh/listmonk/blob/master/LICENSE
- https://github.com/chatwoot/chatwoot and https://github.com/chatwoot/chatwoot/blob/develop/LICENSE
- https://github.com/umami-software/umami and https://github.com/umami-software/umami/blob/master/LICENSE
- https://github.com/mautic/mautic and https://github.com/mautic/mautic/blob/7.x/LICENSE.txt

Upstream components retain their own licenses. Aegntic's proposed revenue/MAU license does not replace those grants.

## Updated launch sequence

Following the publishing discussion: evaluate Ghost for the blog, build-in-public journal, publication newsletter and memberships, with Twenty for sales CRM. Defer listmonk/Mautic until a concrete requirement exceeds the publication workflow. Ghost would own its publication subscription/suppression records; do not synchronize CRM contacts into subscribers without consent. Ghost is a plan, not an installed or connected service. Keep supported runtime/hosting and upstream notices. Source: https://github.com/TryGhost/Ghost.

Convex remains the preferred shared application backend, deferred until shared access is needed. Existing local SQLite is the current single-user application store; Pi Durable remains execution authority. Activepieces Community core and Crawlee remain the automation/extraction defaults, unconnected.
