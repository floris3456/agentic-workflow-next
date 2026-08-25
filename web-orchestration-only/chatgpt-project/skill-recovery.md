# Recovery and reconciliation

## Trigger

Use only after a timeout, disconnect, failed or ambiguous mutation or publication,
uncertain agent session, Git synchronization problem, or external action whose
effect is not trustworthy.

## Reconcile before replay

Do not repeat the operation merely because its response is missing or failed.
Inspect the evidence that can reveal its effect:

- the selected route's existing process or agent session;
- local branch, HEAD, status, and in-progress Git operation when locally visible;
- exact remote refs, commits, changed files, checks, and publication target; and
- the canonical task record plus useful concise progress.

Absorb and continue an effect that already exists. Retry only when evidence proves
the original effect did not occur and the retry is still authorized and safe. If
state remains ambiguous, stop dependent mutation and state the observation or
human/operator action needed to resolve it.

Do not launch another mutating route over unresolved work. A Dual task stays with
its existing Lead and Spark while they can be reconciled; another developer or
maintenance route is not a substitute.

After an uncertain commit or push, compare local and remote refs, ancestry, and
the expected tree before further Git mutation. Never force shared history as
routine recovery. After an uncertain external publication, read the destination
for the exact intended effect and never republish an effect already present.

Update task progress only when it improves resumption. Record current position,
material evidence, meaningful failed attempt or route change, blocker, checks,
remaining work, and next action—not a copied plan or command log.

Leave recovery when the prior effect is understood well enough to continue,
safely retry, make a fresh route decision without duplication, or surface a real
human/operator boundary.
