# DeepSeek Harness Plugin Landscape

## Summary

This reference gives an agent one searchable map of every DeepSeek Harness Cordis plugin in `packages/`. Each entry explains what the plugin enables, how it composes with adjacent services and profiles, what it can place in model context, and the limitation most likely to affect a design. Package READMEs remain the owners of configuration and complete behavior; this page links to them instead of duplicating their tables. Libraries, installable profile bundles, and vendored Cordis packages appear only through those owner links because they are not mountable DSH plugin entries.

## Table of Contents

- [System orientation](#system-orientation)
- [How to read an entry](#how-to-read-an-entry)
- [Plugin landscape](#plugin-landscape)
- [Further Exploration](#further-exploration)
- [Dev Note](#dev-note)

-----

<a id="system-orientation"></a>
## System orientation

A supported application starts from a named profile. Ordered bundles and patch files produce one Cordis plugin tree; the Web profile can also mount a scoped preset composition for each agent. Service Definition plugins declare stable `ctx` APIs, Service Providers implement them, Consumers turn them into model-facing or product-facing behavior, and policies modify behavior through events.

```text
profile + bundles + patches
            |
            v
      Cordis plugin tree
            |
 user input -> Agent -> agent loop -> LLM adapter
                 |          |
                 |          +-> tool registry -> Consumer -> provider/policy
                 |
                 +-> Session event log -> persistence -> projections -> Host/Client UI
```

The Session event log owns reconstructable conversation history. Model-visible input must be logged, while process-local coordination and browser presentation can remain outside model context. The [architecture reference](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/architecture.md) owns the full turn flow, and the [capability map](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/capability-seams.md) relates Service Definitions, Service Providers, and Consumers.

-----

<a id="how-to-read-an-entry"></a>
## How to read an entry

Each plugin has exactly three paragraphs. The first states the outcome. The second starts with `Composition:` and states the plugin's controlled roles, important contributions, required or optional peers, and shipped or opt-in placement. The third names the affected agent and classifies the model effect, then gives one decision-relevant limitation and links the package contract.

The current source inventory contains 205 mountable plugins across 48 groups. It excludes 40 non-plugin packages, 11 installable bundles, and `vendor/`; source entry shape decides the class when documentation metadata disagrees.

`Direct` means the plugin itself contributes request content, tool definitions, calls, results, or retained messages. `Indirect` means it changes another contributor or supplies content through a separate Consumer. `None` means the plugin cannot change model context. A mixed entry names each affected current, child, or recipient agent separately.

Placement describes activation rather than package availability. `Shipped` plugins are active in at least one repository profile or selectable preset, `conditional` rows require an overlay or runtime condition, and `opt-in` plugins require an explicit composition entry. The exact profile tree remains owned by the [configuration catalog](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/config-catalog.md) and package or bundle configuration.

-----

<a id="plugin-landscape"></a>
## Plugin landscape

The groups follow the package map's architecture-oriented order. Search for a package name when you know it; start from a group when you are choosing a capability or tracing its providers and Consumers.

| Group | Plugins | Group | Plugins |
|---|---:|---|---:|
| [core](#core) | 7 | [api](#api) | 5 |
| [typert](#typert) | 2 | [goal](#goal) | 4 |
| [schedule](#schedule) | 1 | [feedback](#feedback) | 2 |
| [llm](#llm) | 7 | [e2b](#e2b) | 3 |
| [subprocess](#subprocess) | 2 | [shell](#shell) | 10 |
| [terminal](#terminal) | 3 | [code-runtime](#code-runtime) | 2 |
| [sandbox](#sandbox) | 3 | [fs](#fs) | 7 |
| [lsp](#lsp) | 3 | [skill](#skill) | 4 |
| [compaction](#compaction) | 4 | [context](#context) | 6 |
| [subagent](#subagent) | 8 | [jobs](#jobs) | 3 |
| [experimental](#experimental) | 4 | [workflow](#workflow) | 4 |
| [webhook](#webhook) | 2 | [web](#web) | 6 |
| [attachment](#attachment) | 2 | [spill](#spill) | 3 |
| [todo](#todo) | 1 | [plan](#plan) | 1 |
| [preset](#preset) | 2 | [guard](#guard) | 2 |
| [extensions](#extensions) | 4 | [hooks](#hooks) | 2 |
| [session](#session) | 12 | [session-query](#session-query) | 4 |
| [settings](#settings) | 2 | [credentials](#credentials) | 3 |
| [storage](#storage) | 4 | [workspace](#workspace) | 1 |
| [sdk](#sdk) | 1 | [acp](#acp) | 1 |
| [interaction](#interaction) | 5 | [host](#host) | 7 |
| [client](#client) | 40 | [examples](#examples) | 1 |
| [test-support](#test-support) | 1 | [runtime-diagnostics](#runtime-diagnostics) | 1 |
| [karaka](#karaka) | 2 | [mcp](#mcp) | 1 |

### core

The [core package group](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/core/README.md) is the product API spine: every standard composition combines its append-only session log, prompt assembly, tool registry, agent handle, model default, and concrete turn driver.

#### `@deepseek-ai/dsh-agent`

This package exposes the live `Agent` handle and registry for creating, resuming, prompting, steering, injecting, cancelling, and observing agents while keeping the concrete driver replaceable.

Composition: Service Definition and registry at `ctx.agents`, with agent events and initiator scope; Typert registration is conditional and no loop service is required. Standard compositions ship it.

Model effect — current agent, direct: accepted follow-ups, steering, injection, and scoped contributions alter retained history or request assembly; initiator identity does not cross processes or restarts automatically. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/core/agent/README.md)

#### `@deepseek-ai/dsh-agent-default-model`

This service centralizes the provider, model, and optional reasoning effort that entry points apply when a fresh session has not already selected a model for new agents.

Composition: Service Definition and provider at `ctx.agentDefaultModel`, with optional settings integration and no required Harness service peer. The base bundle ships one process-wide default.

Model effect — current agent, indirect: entry points use the resolved selection for new agents, but existing sessions retain their logged selection and per-session choice remains entry-point-owned. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/core/agent-default-model/README.md)

#### `@deepseek-ai/dsh-agent-loop`

This concrete driver creates fresh or resumed agents and runs the lifecycle that claims prompts, assembles requests, streams responses, dispatches tools, and records every result.

Composition: Service Provider registered with `ctx.agents`, requiring agents, sessions, LLM, tools, system prompt, and session projections; settings and persistence are conditional integrations. The base bundle ships it.

Model effect — current agent, direct: every step receives assembled prompt, visible schemas, and derived history; safety classification cannot compare sibling calls, so dependent calls must remain exclusive. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/core/agent-loop/README.md)

#### `@deepseek-ai/dsh-agent-tool-presentation`

This preset row chooses whether one agent sees native tool schemas, the PTC `run_code` transport and generated SDK, or both, without moving execution off the host.

Composition: Consumer that contributes one agent-scoped presentation selection to `ctx.tools`; tools is its sole hard service peer, and code runtime is conditional for PTC modes. Shipped PTC presets mount it explicitly.

Model effect — current agent, indirect: `dsh-tools` renders the selected projection; a PTC choice fails during composition when the deployment provides no code runtime. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/core/agent-tool-presentation/README.md)

#### `@deepseek-ai/dsh-session`

This foundational package owns the append-only event log, in-memory session store, extensible event vocabulary, and deterministic derivation of model message history from recorded surface operations.

Composition: Service Definition and provider at `ctx.sessions`, with the session event and surface registries; scoping is its key hard peer. Every standard composition ships it, while persistence remains separate.

Model effect — current agent, direct: derived surface messages form conversation history and recovery can add risk-specific errors; live-session forks only cut at stable boundaries. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/core/session/README.md)

#### `@deepseek-ai/dsh-system-prompt`

This service assembles the model's system prompt and tool schemas from ordered sections, runtime contexts, tool providers, named variables, fixed harness identity, and deployment persona.

Composition: Service Definition and provider at `ctx.systemPrompt`, accepting global and agent-scoped contributions; LLM, scoping, and invariants are hard peers. The base bundle ships it for every agent.

Model effect — current agent, direct: rendered identity, persona, sections, contexts, and schemas enter every step; end users cannot edit deployment-authored prompt text through this service. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/core/system-prompt/README.md)

#### `@deepseek-ai/dsh-tools`

This registry lets plugins define typed tools and runs model calls through policy, monotonic guards, wrappers, result finalization, inspection, and presentation in native or PTC form.

Composition: Service Definition and provider at `ctx.tools`, contributing schemas through its required system-prompt peer; agent, runtime, LLM, session, approval, and scoping values are execution context rather than activation requirements. The base bundle ships it.

Model effect — current agent, direct: visible schemas, PTC guidance, call arguments, and finalized results enter requests; execution-mode policy reads definitions directly rather than consulting an event interceptor. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/core/tools/README.md)

### api

The [API package group](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/api/README.md) connects Host services to generated Client APIs through Typert RPC, application-selected Remote assemblies, and controllers for sessions, settings, credentials, and workspaces.

#### `@deepseek-ai/dsh-api-gateway`

Dispatches generated Typert calls between Host and Client Cordis environments, providing the Host gateway service and Client remote endpoint over a separately supplied transport connection.

Composition: Two-faced transport adapter providing `typertGateway` on Host and `remote` on Client; Host requires Typert, while Client requires Typert and Connection. The base Web composition ships both faces.

Model effect on current agent: none because RPC dispatch adds no prompt, tool, or session event; unclassified dispatch failures cross the connection with intentionally empty details. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/api/gateway/README.md)

#### `@deepseek-ai/dsh-api-remotes`

Assembles the application-approved Host Remote capabilities and forwarded events into generated Client runtime values, keeping the exposed browser application API set explicit at build time.

Composition: Host and Client BFF assembly requiring API Gateway plus selected controller namespaces; the Web application ships it, while other profiles omit this browser-facing capability set.

Model effect on current agent: none because it selects application methods and events only; clients cannot discover additional active Host services or Remote definitions dynamically. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/api/remotes/README.md)

#### `@deepseek-ai/dsh-api-session-controller`

Serves workspace and application-owned session creation, paged history, follow streams, live agent control, model catalogs, skills, references, and related cold reads through generated Remote namespaces.

Composition: Host controller requiring default model, agents, attachments, LLM, sessions, projections, query, Typert, and Workspace Registry; persistence, cache, jobs, presets, skills, and titles are optional. Web and Karaka ship it.

Model effect on current agent: none because invoked Agent commands own any model-visible input; process-local control baselines cannot reconstruct running jobs after a Host restart. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/api/session-controller/README.md)

#### `@deepseek-ai/dsh-api-settings-controller`

Exposes redacted user settings and credential metadata plus validated configuration writes through generated browser Remote namespaces without ever returning stored secret values to the Client.

Composition: Host Remote controller requiring Typert registration, with settings, credentials, and presets as optional invocation-time providers. The Web application ships both namespaces even when a provider is missing.

Model effect on current agent: none because configuration RPC adds no prompt, tool, or session event; credential batch operations accept at most 64 references per request. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/api/settings-controller/README.md)

#### `@deepseek-ai/dsh-api-workspace-controller`

Creates, renames, removes, reorders, archives, and follows durable workspaces and their contained sessions through reconnect-safe generated Remote methods and complete browser-side workspace projection state snapshots.

Composition: Host controller requiring Typert and Workspace Registry; its separate picker controller requires Directory Picker, while the Client face requires Remote and `remote.workspace`. The Web application ships it as the browser's workspace command and state owner.

Model effect on current agent: none because workspace organization is Host and Client control state; follow reconnects replace the whole projection and offer no durable cursor or incremental catch-up. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/api/workspace-controller/README.md)

### typert

The [typert package group](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/typert/README.md) makes generated runtime reflection, schemas, and Remote descriptors available to Host and Client Consumers, with Loader-driven registration and a shared live registry.

#### `@deepseek-ai/dsh-typert-loader`

Automatically discovers generated Host Typert exports for Loader entries, registers each package's reflection and schemas, and withdraws them with plugin lifecycle while safely skipping packages without artifacts.

Composition: Consumer of Cordis Loader and `ctx.typert`, contributing lifecycle-owned package registrations. Loader, Typert Registry, invariants, and Cordis are hard peers; no optional dependency is declared. The base bundle ships it, with explicit package entries available for nested plugins.

Model effect — current agent, none: registration reaches requests only through another Consumer. Discovery covers the Host face only, nested non-Loader plugins need explicit entries, and cached missing-export verdicts require restart after artifacts appear. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/typert/loader/README.md)

#### `@deepseek-ai/dsh-typert-registry`

Stores generated package reflection, live Zod schemas, Remote descriptors, lookup functions, and scoped Context providers under stable runtime keys with atomic, fiber-owned registration and withdrawal.

Composition: Service Provider for `ctx.typert` on Host and browser faces. Cordis is the hard peer and no optional dependency is declared. The base and Web kernel compositions ship it immediately for Loader, Gateway, and inspection Consumers.

Model effect — current agent, none: registry Consumers own any model-visible projection. It does not merge Host and Client graphs, rejects same-key cross-face schemas in one Context, and regenerates JSON Schema documents on every call. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/typert/registry/README.md)

### goal

The [goal package group](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/goal/README.md) provides durable same-session objectives, human and model controls, and an optional round driver that continues armed work while preserving explicit completion authority.

#### `@deepseek-ai/dsh-command-goal`

Lets humans create, edit, pause, resume, clear, and inspect the current persisted session goal directly with `/goal`, without spending a model turn on lifecycle control.

Composition: Human command consumer requiring command and goal services; the base composition ships it, and standard, PTC, and Cordis presets make it available through interactive command adapters.

Model effect on current agent: indirect only when a goal driver later renders changed state; the command interface accepts plain text and offers no modal editor or typed confirmation. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/goal/command-goal/README.md)

#### `@deepseek-ai/dsh-goal`

Stores one objective, phase, round count, and revision history in each agent's durable event log so long-running goal work survives turns, resume, forks, and process restarts.

Composition: Goal service and session projection requiring agents and session projections; Session values identify state but no sessions registry is injected. The base composition ships it, while commands, tools, and the driver remain separate consumers.

Model effect on current agent: none by itself because mutations add no request context; the service owns state, not scheduling, evaluation, retry, or automatic continuation. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/goal/goal/README.md)

#### `@deepseek-ai/dsh-goal-round-driver`

Starts another model turn whenever an idle session has an active armed goal and remaining round capacity, serializing admissions and recording each round against durable goal state.

Composition: Orchestrator requiring goal, agent, and session services; it starts turns through the Agent runtime rather than consuming LLM directly. The base composition and agent-spine example ship it, but work continues only for an explicitly active goal.

Model effect on current agent: direct through retained goal-round user messages; no independent evaluator verifies completion, so the model-facing goal policy decides when evidence is sufficient. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/goal/goal-round-driver/README.md)

#### `@deepseek-ai/dsh-tool-goal`

Gives the model tools to inspect, create, edit, pause, resume, complete, or block the current durable goal with execution-time checks against human intent and current revisions.

Composition: Tool and prompt Consumer requiring goals, agents, tools, system prompt, and session projections. The base composition includes it, and standard, PTC, and Cordis presets activate it.

Model effect on current agent: direct through goal policy, schemas, and retained results; deciding whether human intent warrants a goal remains model judgment despite execution-time authority checks. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/goal/tool-goal/README.md)

### schedule

The [schedule package group](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/schedule/README.md) provides opt-in, session-local durable one-time and fixed-rate reminders, three management tools, and an optional client projection; delivery occurs only within a live conversation.

#### `@deepseek-ai/dsh-schedule`

This plugin creates, lists, cancels, replays, and delivers durable session-local reminders, batching overdue fixed-rate records and optionally publishing the complete active-record set for Web clients.

Composition: Agent-scoped Consumer requiring agents, sessions, tools, and session persistence, with session projections optional, contributing three tools, schedule events, timers, and an optional projection. It is opt-in through the Schedule overlay.

Model effect — recipient agent, direct: tool schemas and untrusted reminder messages enter its history; a cold session receives overdue reminders only after a live root agent resumes it. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/schedule/schedule/README.md)

### feedback

The [feedback package group](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/feedback/README.md) records human evaluation without feeding it back into the model, separating free-text Session remarks from durable per-assistant-message ratings and notes.

#### `@deepseek-ai/dsh-command-feedback`

Lets Web users record an exact free-text Session remark with `/feedback`, immediately acknowledges its Session, anonymous identity, and sharing policy, and never starts or interrupts model work.

Composition: Consumer of Commands, Session, anonymous identity, and optional telemetry policy, contributing the `/feedback` handler and log event. Those core services and Cordis are hard peers; no optional dependency is declared. The base bundle ships it for Web command clients.

Model effect — current agent, none: command input, acknowledgement, and feedback record remain log-only. There is no retrieval, structured classification, amendment, withdrawal, or explicit durability flush, and shipped non-Web entry points lack slash commands. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/feedback/command-feedback/README.md)

#### `@deepseek-ai/dsh-message-feedback`

Provides versioned positive or negative ratings and optional notes for finalized assistant messages, stored beside Session data across restarts and exposed to product surfaces through list, put, and delete.

Composition: Service Provider for `ctx.messageFeedback`, consuming Session persistence, domain storage, LLM message identity, and Typert protocol. Those services and Cordis are hard peers; no optional dependency is declared. The Web bundle ships it with an 8192-byte note cap.

Model effect — current agent, none: ratings and notes register no tool, prompt, context, or Session event. Compare-and-set is single-process, and the service carries no authenticated actor or audit identity. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/feedback/message-feedback/README.md)

### llm

The [LLM package group](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/llm/README.md) owns provider-neutral request and stream types, official and multi-provider adapters, request extensions, retry execution, active-package metadata, and replay-aware token measurement.

#### `@deepseek-ai/dsh-deepseek-llm-api-extensions`

Lets plugins contribute validated additive top-level fields to official DeepSeek API requests without changing the base adapter or claiming provider-neutral routing semantics for those fields.

Composition: Registry provider for `deepseekLlmApiExtensions`, consumed optionally by the official DeepSeek adapter; the base and SDK-minimal compositions ship it, while contributor plugins remain independently mounted.

Model effect on current agent: indirect because fields travel outside messages, prompts, and tool schemas; the registry supports official DeepSeek requests only and promises no JSON member ordering. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/llm/deepseek-llm-api-extensions/README.md)

#### `@deepseek-ai/dsh-llm`

Defines provider-neutral model requests, messages, content blocks, model catalogs, route capabilities, adapter registration, retry-policy facts, and normalized streaming response chunks for every Harness model caller.

Composition: Service definition and adapter registry for `llm`; agent loops and other callers require it, while provider adapters register routes. The base and SDK-minimal compositions ship the service.

Model effect on current agent: none because the service adds no content; it executes neither retry, caching, nor rate limiting, leaving those behaviors to adapters and policy plugins. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/llm/llm/README.md)

#### `@deepseek-ai/dsh-llm-deepseek`

Routes Harness requests to official DeepSeek chat completions, translating reasoning, tool calls, streaming chunks, credentials, image inputs, and configurable model catalogs through the `deepseek-official` provider route.

Composition: LLM adapter requiring the `llm` service, with settings, credentials, attachments, filesystem mapping, and request extensions conditional; the base and SDK-minimal profiles ship it active.

Model effect on current agent: direct because the selected model receives assembled prompts, history, tools, call settings, and supported images; a settings model array replaces the configured catalog wholesale. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/llm/llm-deepseek/README.md)

#### `@deepseek-ai/dsh-llm-pi-ai`

Registers multiple configurable provider routes backed by pi-ai catalogs or custom gateways, translating common Harness requests, response streams, credentials, authorization, image inputs, and per-route model discovery.

Composition: LLM adapter requiring the `llm` service, with settings, credentials, authorization, attachments, and filesystem mapping conditional; the base composition ships it for optional configured routes.

Model effect on current agent: direct because pi-ai sends assembled context, tools, sampling fields, and images; image-byte limits exclude surrounding text and JSON overhead, so deployments need gateway headroom. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/llm/llm-pi-ai/README.md)

#### `@deepseek-ai/dsh-llm-retry`

Retries eligible failed agent model requests at the open-step extension point, preserving the same durable turn and reconstructed request while applying each provider route's resolved retry policy.

Composition: Recovery-policy consumer requiring agent, session, LLM, and projection services; the base composition and agent-spine example ship it, while direct `llm.stream` callers remain outside its retry boundary.

Model effect on current agent: none for failed attempts because errors, delays, and partial chunks stay hidden; only agent turns receive retries, so direct LLM consumers remain single-attempt. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/llm/llm-retry/README.md)

#### `@deepseek-ai/dsh-plugin-package-inventory-deepseek`

Adds the active Loader-backed plugin package identities to official DeepSeek requests as provider diagnostics, refreshing the complete package list whenever mounted Loader configuration entries change.

Composition: Provider-extension contributor requiring agents, Loader, and the DeepSeek request-extension registry, with presets as optional enrichment. The base and SDK-minimal compositions ship it active beside the official adapter.

Model effect on current agent: none because package identities are provider metadata outside model input; programmatic fibers, loose modules, and in-place manifest replacements lack authoritative live package provenance. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/llm/plugin-package-inventory-deepseek/README.md)

#### `@deepseek-ai/dsh-token-meter`

Folds durable session events into replay-aware token estimates, current context pressure, detailed breakdown projections, and per-message costs shared by compaction and other pressure-sensitive runtime consumers.

Composition: Measurement service requiring session projections, with LLM route image pricing optional and compaction or retry Consumers used when present. The base composition ships it as shared infrastructure.

Model effect on current agent: indirect through consumers such as compaction; fallback text measurement is heuristic rather than provider-tokenizer exact, while exact image pricing depends on route-declared capabilities. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/llm/token-meter/README.md)

### e2b

The [E2B package group](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/e2b/README.md) supplies one shared remote Linux sandbox plus filesystem and subprocess adapters, keeping files, commands, and terminals in the same isolated execution world.

#### `@deepseek-ai/dsh-e2b`

Creates and owns one shared remote E2B Linux sandbox for the provider family, exposing its lifecycle to filesystem and subprocess adapters and deleting it when the family stops.

Composition: Runtime provider for the E2B family with no model consumer of its own; no supported profile ships it active, so deployments opt into the owner and both desired adapters.

Model effect on current agent: none because it contributes no request content; the sandbox hosts execution providers only, not the Harness runtime, agent state, session log, or LLM calls. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/e2b/e2b/README.md)

#### `@deepseek-ai/dsh-fs-e2b`

Implements the filesystem service inside the shared E2B sandbox so remote reads, listings, writes, edits, identities, and metadata operate in the same world as remote commands.

Composition: `fs` provider requiring the filesystem definition and E2B sandbox owner; it is opt-in and must be mounted with the shared owner before filesystem consumers.

Model effect on current agent: indirect through filesystem tools and their normalized results; files do not synchronize with the host, so an empty remote cwd stays empty until populated. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/e2b/fs-e2b/README.md)

#### `@deepseek-ai/dsh-subprocess-e2b`

Implements subprocess and interactive terminal execution inside the shared E2B sandbox, preserving the Harness process contract while keeping agent commands away from the host machine.

Composition: `subprocess` provider requiring the subprocess definition and E2B owner; it is opt-in and normally accompanies the E2B filesystem provider so commands and files share one world.

Model effect on current agent: indirect through shell and terminal consumers; the E2B SDK still retains complete command output in host memory before bounded consumer rendering. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/e2b/subprocess-e2b/README.md)

### subprocess

The [subprocess package group](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/subprocess/README.md) defines managed child-process and terminal execution plus the local provider responsible for executable lookup, process trees, streams, and cross-platform termination.

#### `@deepseek-ai/dsh-subprocess`

Defines executable resolution, fully specified child-process spawning, live standard-output streams, interactive terminal sessions, settled exit facts, and whole-process-tree termination behind one provider-neutral subprocess runtime service.

Composition: Service definition for `subprocess`, required by shell, LSP, ACP, SDK, and search providers; the base and SDK-minimal compositions ship it through the local provider.

Model effect on current agent: indirect through command consumers; transports that own internal SDK subprocesses remain outside this service's lifecycle and termination accounting. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/subprocess/subprocess/README.md)

#### `@deepseek-ai/dsh-subprocess-local`

Resolves host executables, starts detached local process trees with explicit stdio, provides real PTY sessions through node-pty, and escalates termination when children do not exit.

Composition: `subprocess` service provider requiring the service definition and timeout support; the base and SDK-minimal compositions ship it for host execution, while E2B replaces it remotely.

Model effect on current agent: indirect through shell, terminal, and delegation consumers; Windows process-tree cleanup is best-effort and depends on platform facilities and child behavior. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/subprocess/subprocess-local/README.md)

### shell

The [shell package group](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/shell/README.md) separates command execution contracts, local and sandboxed providers, managed environments, and model-facing Bash or PowerShell tools, including persistent terminal variants for workflows that need cross-call state.

#### `@deepseek-ai/dsh-bash-local`

Runs each POSIX command in a fresh non-login Bash process, applying configured cwd, timeout, and output bounds while returning spill-backed results without preserving shell state between calls.

Composition: Service provider for `shell`, requiring subprocess execution and optionally settings; it is available through explicit composition, while shipped profiles normally select the sandboxed Bash provider instead.

Model effect on current agent: indirect through the Bash consumer's output and errors; commands run with the harness process's full authority, so confinement requires the sandbox provider. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/shell/bash-local/README.md)

#### `@deepseek-ai/dsh-bash-sandbox`

Runs fresh Bash commands through the selected sandbox runner and fails closed when a requested confined mode cannot be enforced, while preserving the local provider's bounded process behavior.

Composition: Sandboxed `shell` service provider requiring subprocess, sandbox, and sandbox-policy services; the base composition ships it for supported applications, with settings available when that service is mounted.

Model effect on current agent: indirect through Bash schemas, permission fields, and classified results; confinement covers file effects, not network access or uniform process visibility. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/shell/bash-sandbox/README.md)

#### `@deepseek-ai/dsh-pwsh-local`

Runs each command in a fresh non-interactive PowerShell process with profile loading disabled, UTF-8 output, explicit budgets, and no cwd, environment, function, or job state retained between calls.

Composition: PowerShell `shell` service provider requiring subprocess execution and optionally settings; deployments mount it explicitly, while shipped profiles normally use the sandboxed PowerShell provider where PowerShell is available.

Model effect on current agent: indirect through the PowerShell tool's bounded output and failures; the provider is unconfined and executes with the harness process's authority. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/shell/pwsh-local/README.md)

#### `@deepseek-ai/dsh-pwsh-sandbox`

Runs fresh PowerShell commands through platform sandbox runners, records enforcement and denial facts, and refuses confined execution when no runner can satisfy the selected policy.

Composition: Sandboxed `shell` provider requiring subprocess, sandbox, and sandbox-policy services; the base composition ships it beside the PowerShell tool, subject to an available `pwsh` executable.

Model effect on current agent: indirect through PowerShell results and standard permission-denial rendering; on Windows the ACL runner restricts writes but does not restrict reads. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/shell/pwsh-sandbox/README.md)

#### `@deepseek-ai/dsh-shell`

Defines the provider-neutral shell executor that resolves explicit command requests into foreground results or background handles, allowing Bash and PowerShell consumers to work over interchangeable execution providers.

Composition: Provider-neutral Service Definition for `shell` with no Harness service dependency; executors own subprocess use and configuration. The base composition ships it before sandboxed providers and model-facing consumers.

Model effect on current agent: indirect through shell tools that render command output and sandbox facts; the service has no interactive-input or PTY-session vocabulary. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/shell/shell/README.md)

#### `@deepseek-ai/dsh-shell-env`

Builds the trusted `DSH_*` environment for model shell calls, combining built-in Harness and session facts with uniquely owned plugin contributions collected for each command execution.

Composition: Registry provider for `shellEnv` with no hard service injection; it owns its Harness-home configuration and consults session persistence optionally. The base composition ships it before Bash and PowerShell consumers.

Model effect on current agent: indirect because shell tools pass the managed environment to commands; registry enumeration excludes built-in variables and is not an exhaustive diagnostic view. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/shell/shell-env/README.md)

#### `@deepseek-ai/dsh-tool-bash`

Gives the agent a one-shot `bash` tool with bounded stdout and stderr, background-job support, spill recovery, sandbox escalation fields when supported, and no cross-call shell state.

Composition: Consumer requiring tools, shell, shell-environment, and system-prompt services, with jobs, approval, and sandbox policy used conditionally; the base composition ships it and agent presets activate it on selection.

Model effect on current agent: direct through Bash guidance, schema, calls, and retained results; replay infers exit pills from result text and can misclassify matching final output lines. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/shell/tool-bash/README.md)

#### `@deepseek-ai/dsh-tool-bash-persistent`

Gives each agent an owner-scoped `bash` tool whose terminal preserves cwd, exported variables, functions, and background jobs across serialized command calls in the same session.

Composition: Tool consumer requiring tools and terminal services plus an owning agent at execution; the SDK-minimal profile and minimal preset ship it, while other compositions may opt in.

Model effect on current agent: direct through the stable Bash schema and terminal output; agentless calls and backends without a real interactive Bash PTY cannot execute it. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/shell/tool-bash-persistent/README.md)

#### `@deepseek-ai/dsh-tool-pwsh`

Gives the agent a one-shot `pwsh` tool mirroring Bash execution semantics while using PowerShell syntax, native Windows paths, `$env:` variables, background jobs, and fresh processes.

Composition: Consumer requiring tools, shell, shell-environment, and system-prompt services, with jobs, approval, and sandbox policy conditional; the base composition ships it and presets activate it when selected.

Model effect on current agent: direct through PowerShell guidance, schema, calls, and retained results; Windows sandbox language mode and named-pipe behavior can constrain otherwise valid scripts. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/shell/tool-pwsh/README.md)

#### `@deepseek-ai/dsh-tool-pwsh-persistent`

Gives each agent an owner-scoped `pwsh` tool whose terminal preserves cwd, environment variables, functions, and background jobs across serialized PowerShell command calls in one session.

Composition: Tool consumer requiring tools and terminal services plus an owning agent at execution; the SDK-minimal profile and minimal preset ship it, while other compositions may opt in.

Model effect on current agent: direct through the PowerShell schema and terminal results; completed results strip submitted-input echo, but bounded partial-output paths can retain wrapped partial echo. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/shell/tool-pwsh-persistent/README.md)

### terminal

The [terminal package group](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/terminal/README.md) provides owner-scoped persistent PTY sessions, a sandboxed interactive bash or PowerShell backend, and optional model tools for workflows needing cross-call state or stdin.

#### `@deepseek-ai/dsh-terminal`

This service creates persistent owner-scoped terminal sessions with opaque identifiers, exact-agent fencing, backend routing, and awaited cleanup while leaving spawning and presentation to separate plugins.

Composition: Service Definition and provider at `ctx.terminals`; agent, branding, and invariants are hard peers. SDK-minimal and minimal-agent compositions ship it with shell backends, while standard toolsets may omit terminals.

Model effect — current agent, indirect: only a consumer can return terminal state; sessions and raw scrollback are process-local and disappear on harness restart. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/terminal/terminal/README.md)

#### `@deepseek-ai/dsh-terminal-bash`

This backend starts persistent interactive bash or PowerShell sessions under shared sandbox policy, detects readiness, retains bounded line-oriented output, and supports local or remote subprocess worlds.

Composition: Service Provider registered as the `shell` backend on `ctx.terminals`; terminal, subprocess, sandbox, policy, agent, session, projection, and invariants are hard peers. SDK-minimal and minimal presets ship it.

Model effect — current agent, indirect: terminal consumers can return bounded output and policy context; full-screen alternate-buffer applications fall outside its line-oriented protocol. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/terminal/terminal-bash/README.md)

#### `@deepseek-ai/dsh-tool-terminal`

This tool consumer gives the model six owner-fenced operations to open, send to, read, signal, close, and list persistent sessions, with foreground or job-backed sends.

Composition: Consumer that contributes six tools and usage guidance; terminal, tools, jobs, prompt, output retention, agent, LLM, and invariants are hard peers. It is opt-in rather than part of standard presets.

Model effect — current agent, direct: schemas, guidance, and bounded terminal results enter history; tools expose no TUI key sequences, alternate-screen interaction, resize, or automatic startup. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/terminal/tool-terminal/README.md)

### code-runtime

The [code-runtime package group](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/code-runtime/README.md) defines one-shot model-program execution and a worker-thread provider used by PTC mode to call selected host functions through generated bindings.

#### `@deepseek-ai/dsh-code-runtime`

Defines one-shot execution of a model-written program against named asynchronous host functions, returning its value, captured logs, and optional failure without prescribing an isolation backend.

Composition: Service definition for `codeRuntime`, consumed by PTC mode and implemented by a separately mounted backend; headless and Web profiles ship the worker-thread provider where PTC is supported.

Model effect on current agent: indirect through the `run_code` consumer's retained output; the service offers neither streaming progress nor an interactive continuation for a running program. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/code-runtime/code-runtime/README.md)

#### `@deepseek-ai/dsh-code-runtime-worker-thread`

Executes each model-written TypeScript program in a fresh Node worker thread, exposing selected asynchronous host bindings and enforcing configured time, log, value, and serialization limits.

Composition: `codeRuntime` provider requiring the definition, session context, and timeout support; headless and Web profiles ship it, while other compositions may mount it for PTC mode.

Model effect on current agent: indirect through `run_code` logs, values, and failures; terminating a worker does not terminate operating-system processes that its program spawned. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/code-runtime/code-runtime-worker-thread/README.md)

### sandbox

The [sandbox package group](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/sandbox/README.md) supplies shared file-effect modes, platform-specific same-world enforcement, and per-session policy resolution; the base composition ships local confinement and workspace-write policy.

#### `@deepseek-ai/dsh-sandbox`

This service safely confines subprocesses under read-only, workspace-write, or unrestricted file-effect modes, fails closed when enforcement is unavailable, and coordinates one-time human-approved escalation after denials.

Composition: Service Definition at `ctx.sandbox`, implemented by a platform backend and consumed by confined executors; session, LLM, and invariants are hard peers. The base bundle ships it through `sandbox-local`.

Model effect — current agent, indirect: consumers render confinement errors, denial markers, and escalation outcomes; policy covers file effects, not network, process, syscall, device, or credential restrictions. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/sandbox/sandbox/README.md)

#### `@deepseek-ai/dsh-sandbox-local`

This local provider selects bubblewrap or Landlock on Linux, Seatbelt on macOS, or a restricted-token ACL runner on Windows, and reports enforcement completeness and denial signatures.

Composition: Service Provider registered on `ctx.sandbox`; sandbox, session, LLM, and invariants are hard peers. Base and SDK-minimal bundles ship it and fail closed when no runner works.

Model effect — current agent, indirect: shell consumers expose enforcement outcomes; Windows reports partial enforcement because objects writable by Everyone and hard-link aliases remain outside complete control. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/sandbox/sandbox-local/README.md)

#### `@deepseek-ai/dsh-sandbox-policy`

This policy service resolves one file-effect mode and workspace root across enforcing capabilities, persists per-session overrides, and reports the current standing policy before agent requests.

Composition: Service Provider at `ctx.sandboxPolicy`, requiring session projections and adding prompt context only when system prompt is present; agent, Session, and sandbox do not gate activation. Base and SDK-minimal bundles ship it.

Model effect — current agent, direct: durable runtime context names the mode and primary workspace root; extra writable roots are outside the resolved execution policy. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/sandbox/sandbox-policy/README.md)

### fs

The [filesystem package group](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/fs/README.md) defines a swappable file service, host and sandbox providers, observation policy, and alternative model tools for bounded reading, atomic mutation, discovery, and editor-style operations.

#### `@deepseek-ai/dsh-fs`

Defines backend-neutral path identity, bounded text and byte reads, directory listing, atomic writes, literal edits, optional version guards, and policy events for one execution filesystem.

Composition: Service definition for `fs`; deployments pair it with exactly one backend, while tools and policy plugins consume its service and events. The base composition supplies it through its filesystem provider.

Model effect on current agent: indirect through filesystem consumers; mutations support UTF-8 text only, and the service offers no delete, rename, copy, recursive listing, watch, or I/O deadline. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/fs/fs/README.md)

#### `@deepseek-ai/dsh-fs-local`

Implements filesystem operations against host files with configurable path resolution, symlink-stable identity, bounded text and byte reads, atomic permission-preserving writes, literal edits, and optional stale-version protection.

Composition: `fs` service provider requiring the filesystem definition; the SDK-minimal profile and minimal preset ship it, while deployments needing confinement select the sandbox provider instead.

Model effect on current agent: indirect through filesystem tools; configured cwd is only a resolution default, so absolute paths and `..` can escape it. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/fs/fs-local/README.md)

#### `@deepseek-ai/dsh-fs-observation-policy`

Records files observed by each session and converts later writes and edits into create-only or version-checked atomic mutations, enforcing read-before-edit without replacing the filesystem provider.

Composition: Policy consumer of filesystem events with no service API; the base composition ships it before filesystem tools, while direct `fs` callers bypass its observation event path.

Model effect on current agent: indirect through recoverable tool errors; observed state does not survive resume, so a resumed session must read a file again before guarded mutation. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/fs/fs-observation-policy/README.md)

#### `@deepseek-ai/dsh-fs-sandbox`

Extends the local filesystem provider with per-call mutation fencing: read-only denies writes, workspace-write confines them to approved workspace roots, and danger-full-access runs all mutations unfenced.

Composition: `fs` service provider requiring filesystem, local-provider mechanics, sandbox policy, and sandbox services; the base composition ships it active for the supported full application profiles.

Model effect on current agent: indirect through sandbox context and filesystem denial results; the trusted path check narrows but cannot eliminate resolve-to-syscall races against adversarial host processes. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/fs/fs-sandbox/README.md)

#### `@deepseek-ai/dsh-tool-fs`

Gives models bounded line-numbered text reads, conditional durable image reads, atomic whole-file writes, and targeted literal text edits over the active composed filesystem provider service.

Composition: Consumer requiring tools, filesystem, and system-prompt services, with attachments, LLM routing, sandbox policy, and approval conditional; shipped profiles make it available, while Web activates it through presets.

Model effect on current agent: direct through guidance, schemas, calls, text results, and image blocks; text reads reject binary content, and PDF, audio, and video are unsupported. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/fs/tool-fs/README.md)

#### `@deepseek-ai/dsh-tool-fs-search`

Gives models `glob` and `grep` discovery backed by packaged ripgrep, with fixed safe arguments, bounded results, timeouts, optional sampling, and spill recovery for complete oversized output.

Composition: Consumer requiring tools, subprocess, and system-prompt services, with spill optional; shipped full profiles and standard, PTC, and Cordis presets activate it without requiring a filesystem provider.

Model effect on current agent: direct through search guidance, schemas, and retained results; discovered paths are follow-up-readable only when search cwd and filesystem root identify the same workspace. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/fs/tool-fs-search/README.md)

#### `@deepseek-ai/dsh-tool-str-replace-editor`

Provides one `str_replace_editor` tool for numbered file or shallow-directory views, new file creation, unique literal replacement, and text insertion at an exact absolute-path line boundary.

Composition: Consumer requiring tools and filesystem services, with sandbox policy applied when mounted; the base bundle includes an inactive row, while SDK-minimal and the minimal preset activate it.

Model effect on current agent: direct through its schema and bounded results without prompt guidance; operations support UTF-8 text only, and replacement deliberately rejects zero or multiple matches. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/fs/tool-str-replace-editor/README.md)

### lsp

The [LSP package group](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/lsp/README.md) separates provider selection and normalized code-navigation operations from stdio language-server processes and the single model-facing precision-navigation tool.

#### `@deepseek-ai/dsh-lsp`

Routes definition, reference, implementation, and hover queries to registered language-server providers by source file extension, normalizing locations, markup, errors, and branded provider identities consistently per query.

Composition: Service definition and provider registry for `lsp`; deployments mount a provider and the model tool explicitly, because supported profiles do not ship a configured language server.

Model effect on current agent: indirect through the LSP tool; one runtime permits only one provider per extension, so overlapping ownership fails registration rather than selecting dynamically. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/lsp/lsp/README.md)

#### `@deepseek-ai/dsh-lsp-stdio`

Starts configured local language servers over stdio JSON-RPC and translates transiently opened document definition, reference, implementation, and hover requests into normalized Harness LSP query results.

Composition: LSP service provider requiring filesystem and subprocess services in the same execution world; it is opt-in and needs explicit server commands plus extension-to-language mappings.

Model effect on current agent: indirect through normalized LSP tool results; configured language-server processes are trusted and receive no sandboxing or confinement from this provider. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/lsp/lsp-stdio/README.md)

#### `@deepseek-ai/dsh-tool-lsp`

Gives the model one read-only `lsp` tool for definitions, references, implementations, and hover documentation, using exact one-based UTF-16 source positions and bounded normalized result rendering.

Composition: Consumer requiring tools, LSP, and system-prompt services; supported profiles leave it opt-in because it becomes useful only with a configured provider and language server.

Model effect on current agent: direct through precision-navigation guidance, schema, and retained results; UTF-16 columns are difficult to count near non-BMP characters and off-symbol positions can return nothing. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/lsp/tool-lsp/README.md)

### skill

The [skill package group](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/skill/README.md) combines a provider registry, local and bundled skill sources, and a model-facing catalog and loader that reveal detailed instructions only when selected.

#### `@deepseek-ai/dsh-skill`

Merges reusable task instructions from multiple providers behind one catalog and load API, allowing local, embedded, or remote skill sources to coexist with provider-driven cache invalidation.

Composition: Service definition and registry for `skills`, consumed by providers and loaders; the base composition ships it globally, while agent presets determine which scoped providers and consumers are active.

Model effect on current agent: indirect through the skill tool's catalog and loaded instructions; cache invalidation is provider-driven because the registry has no TTL or external-change inference. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/skill/skill/README.md)

#### `@deepseek-ai/dsh-skill-badge`

Publishes the bundled `dsh-badge` skill so agents can load official reusable instructions for adding “powered by dsh” attribution to generated documents and related project content.

Composition: Fixed skill provider requiring the skill registry; the base composition ships its row disabled, so deployments opt in when attribution guidance belongs in the session catalog.

Model effect on current agent: indirect through catalog text and a loaded instruction body; the provider offers exactly one fixed skill and has no runtime customization. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/skill/skill-badge/README.md)

#### `@deepseek-ai/dsh-skill-filesystem`

Discovers directory-bundled or flat Markdown skills from project, configured, and user roots, watches those roots for changes, and loads validated instruction bodies with resource locations.

Composition: Skill provider requiring the skill registry and filesystem access; the base composition ships it, and standard, PTC, and Cordis presets activate scoped instances for selected agents.

Model effect on current agent: indirect through refreshed catalog entries and loaded instructions; discovery scans only one level below each root and ignores deeper nested skill manifests. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/skill/skill-filesystem/README.md)

#### `@deepseek-ai/dsh-tool-skill`

Presents available model-invocable skills as a durable pre-request catalog and lets the agent load one complete current instruction body by name through the `skill` tool.

Composition: Consumer requiring agents, tools, and the skill registry; the base composition ships it, and standard, PTC, and Cordis presets activate it with their scoped filesystem provider.

Model effect on current agent: direct through catalog messages, loader schema, and retained instruction results; routing sees only capped name and description, omitting richer provider metadata and usage guidance. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/skill/tool-skill/README.md)

### compaction

The [compaction package group](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/compaction/README.md) keeps long conversations within model limits through automatic summarization, on-demand `/compact`, and model-free oversized tool-result pruning; the base composition enables all four plugins.

#### `@deepseek-ai/dsh-command-compact`

This chat command condenses older conversation history on demand without consuming a normal model turn, then reports the item count and estimated token reduction to the user.

Composition: Consumer of commands and `ctx.compaction` that contributes `/compact`; those services and invariants are hard peers. The base and standard agent presets ship it alongside the basic backend.

Model effect — current agent, indirect: command text stays outside requests, but successful replacement changes later history; compaction is unavailable rather than queued while the agent is busy. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/compaction/command-compact/README.md)

#### `@deepseek-ai/dsh-compaction`

This shared service lets backends replace an older model-visible history range with one summary while retaining raw events for replay and keeping the recent tail intact.

Composition: Service Definition at `ctx.compaction`, used by backends and command triggers; session, LLM, commands, branding, and invariants are hard peers. Base and standard presets ship it.

Model effect — current agent, indirect: a backend's replacement summary enters future requests, but this service performs no condensation and exposes no model-facing compaction tool. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/compaction/compaction/README.md)

#### `@deepseek-ai/dsh-compaction-basic`

This backend automatically summarizes the oldest eligible history near context pressure, retries after overflow, supports manual condensation, and can first invoke an optional model-free result pruner.

Composition: Service Provider for `ctx.compaction` and Consumer of agent, commands, LLM, session, and token meter; the result pruner is optional. Base and standard presets ship it.

Model effect — current agent, direct: history is replaced by a generated checkpoint after an auxiliary summarizer request; one indivisible oversized non-tool unit cannot be split. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/compaction/compaction-basic/README.md)

#### `@deepseek-ai/dsh-compaction-tool-result-pruner`

This pre-compaction pruner replaces oversized tool-result middles with a marker while preserving bounded heads, tails, rich-block order, and the full original event log unchanged for replay.

Composition: Consumer that provides `ctx.toolResultPruner` to compaction backends; compaction, session, LLM, token meter, and invariants are hard peers. The base and standard presets ship it.

Model effect — current agent, direct: later requests see pruned results without a model call; character thresholds are heuristic, so token-meter pressure remains authoritative. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/compaction/compaction-tool-result-pruner/README.md)

### context

The [context package group](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/context/README.md) adds durable model-visible workspace instructions, file and session references, time, or tmux location without defining tools; most entries are opt-in or Web-specific.

#### `@deepseek-ai/dsh-agent-instructions`

This plugin loads bounded user-global and project instruction chains before the first request, then records newly applicable, changed, or removed nested instructions after structured filesystem activity.

Composition: Consumer of agent, filesystem, tools, session, projection, prompt, and LLM services that contributes durable context events; those services and invariants are hard peers. Base and standard presets ship it.

Model effect — current agent, direct: bounded instruction messages enter retained history; shell navigation cannot trigger nested discovery because only structured filesystem operations provide the required scope signal. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/context/agent-instructions/README.md)

#### `@deepseek-ai/dsh-file-reference`

This provider-neutral service supplies `@file` mention grammar and candidate lookup for host interfaces while leaving filesystem discovery, ranking, caching, and invalidation to a concrete provider.

Composition: Service Definition at `ctx.fileReferences`, with agent and invariants as hard peers; the shipped Web bundle mounts it with the local provider and Session Controller Remote.

Model effect — current agent, indirect: a provider may add guidance, but selecting a candidate only inserts prompt text and does not prove the model's read tool shares that namespace. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/context/file-reference/README.md)

#### `@deepseek-ai/dsh-file-reference-local`

This local provider returns bounded, ranked workspace paths from a reusable per-agent index, refreshes after tool results, avoids directory symlinks, and guides models that can read files.

Composition: Service Provider for `ctx.fileReferences` requiring agents; its stable guidance activates conditionally when both tools and system prompt are available. The Web bundle ships it for host-local workspaces.

Model effect — current agent, direct: agents with an effective `read` tool receive stable `@file` guidance; remote or virtual read namespaces require a different provider. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/context/file-reference-local/README.md)

#### `@deepseek-ai/dsh-session-reference`

This service resolves session mentions and captures bounded immutable snapshots of other sessions as explicitly untrusted background, while discovery ranks candidates by workspace affinity and title.

Composition: Consumer and provider around session query, title, projection, session, LLM, and output retention; projection-cache is optional and the other services are hard peers. The Web bundle ships it.

Model effect — current agent, direct: referenced snapshots follow the user's message as retained untrusted context; candidate discovery searches titles but never message bodies. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/context/session-reference/README.md)

#### `@deepseek-ai/dsh-time-context`

This plugin records current time, browser-zone provenance, and elapsed time on eligible preparation steps, with configurable refresh intervals and clarification guidance for mixed or unavailable zones.

Composition: Consumer requiring agents and session projections that contributes durable temporal context; Session and LLM are not activation requirements. It is opt-in through the Schedule Web overlay.

Model effect — current agent, direct: each eligible reading appends time context, but browser-zone provenance guides interpretation and never supplies another tool's required zone argument. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/context/time-context/README.md)

#### `@deepseek-ai/dsh-tmux-context`

This plugin durably records the agent process's tmux session, window, pane, active flags, and pane-tree layout once per changed turn after verifying its controlling terminal.

Composition: Consumer requiring agents and session projections that contributes durable tmux readings; shell and Session are not activation requirements. It is opt-in outside shipped Web and headless compositions.

Model effect — current agent, direct: changed location appends three model-visible lines; pane movement during a turn is not reflected until the next turn. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/context/tmux-context/README.md)

### subagent

The [subagent package group](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/subagent/README.md) separates the delegation registry, in-process and subprocess backends, parent-facing delegation and control tools, and the child-only report channel used by continuable agent trees.

#### `@deepseek-ai/dsh-subagent`

Routes delegated tasks to named child-agent providers, tracks continuable descendants, delivers queued follow-ups, and exposes durable lineage and settlement state without fixing one execution transport.

Composition: Service Definition and continuation registry with no static hard service injection; agents and session projections contribute conditionally, while persistence and query services support optional discovery and recovery. The base composition ships it before providers and tools.

Model effect on current agent: direct through retained settlement notices, while child agents receive provider-owned requests; ACP children remain one-shot and lack locally enumerable child sessions. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/subagent/subagent/README.md)

#### `@deepseek-ai/dsh-subagent-acp`

Runs every delegated task in a fresh ACP-compatible subprocess with its own runtime, session, model, and tools, returning only the final assistant text or a safe error.

Composition: Named subagent service provider requiring the subagent registry and subprocess service; no shipped profile activates it, so deployments configure its ACP command and permission response explicitly.

Model effect on child agent: direct through a standalone task and independent composition; each run pays process and ACP startup cost and cannot apply optional persona, tools, depth, or output-schema controls. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/subagent/subagent-acp/README.md)

#### `@deepseek-ai/dsh-subagent-dsh-sdk`

Runs each delegated task as a complete Harness subprocess over stdio JSON-RPC, allowing the child to use its own profile, persistence, route, tools, and session log.

Composition: Named subagent provider requiring the registry, subprocess service, and SDK client; it is opt-in and needs a command that launches a separately configured Harness runtime.

Model effect on child agent: direct through a standalone task and child profile; every run boots a fresh plugin tree, and non-route persona, tool, depth, and structured-output controls are unsupported. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/subagent/subagent-dsh-sdk/README.md)

#### `@deepseek-ai/dsh-subagent-fork-in-process`

Starts an in-process child seeded with the parent's balanced completed-turn history, then adds the delegated task so follow-up work can continue from established conversation context.

Composition: Named `fork` provider requiring the subagent registry, agent runtime, sessions, and shared in-process driver; the base composition ships it and presets expose configured delegation tools.

Model effect on child agent: direct through copied completed history and the task; the seed is a one-time snapshot and never receives later parent turns automatically. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/subagent/subagent-fork-in-process/README.md)

#### `@deepseek-ai/dsh-subagent-spawn-in-process`

Starts a fresh in-process child with an empty conversation while inheriting the parent's working directory, lineage, model route, reasoning effort, and output limit unless overridden.

Composition: Named `spawn` provider requiring the subagent registry and shared in-process driver; the base composition ships it and presets expose it through configured delegation tools.

Model effect on child agent: direct through the standalone task and child-scoped prompt and tools; the child receives no parent transcript, so its task must be self-contained. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/subagent/subagent-spawn-in-process/README.md)

#### `@deepseek-ai/dsh-tool-subagent`

Exposes one configured delegation provider as a model tool, supporting foreground one-shot work, background continuable work, and eligible child route selection without coupling the model to transport details.

Composition: Consumer requiring tools, subagents, system prompt, and session projections, with settings and LLM model discovery optional. The base composition and agent presets ship several named instances.

Model effect on current agent: direct through adaptive schemas, prompt guidance, and results; background calls do not return the eventual child output through this tool. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/subagent/tool-subagent/README.md)

#### `@deepseek-ai/dsh-tool-subagent-control`

Lets a parent model queue follow-up messages, request interruption, and optionally list continuable descendants through global control tools that do not multiply with delegation-provider instances.

Composition: Consumer requiring tools and the subagent continuation registry; the base composition ships control and list entries, and standard, PTC, and Cordis presets activate them for selected agents.

Model effect on current agent: direct through tool schemas and acknowledgements; queued messages cannot steer the child's current turn, and listing is only a process-local snapshot. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/subagent/tool-subagent-control/README.md)

#### `@deepseek-ai/dsh-tool-subagent-report`

Gives continuable in-process children a scoped `report` tool that sends selected findings to the parent as a new message without ending the child's current turn.

Composition: Child-scoped consumer requiring subagent, tools, and system-prompt services; the base composition ships it, but roots, one-shot children, remote providers, and sibling scopes never receive it.

Model effect on child agent: direct through report guidance, schema, and acknowledgement; accepted delivery is not durable or exactly-once, so process failure can leave the outcome ambiguous. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/subagent/tool-subagent-report/README.md)

### jobs

The [jobs package group](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/jobs/README.md) separates the owner-fenced background-job Definition, its process-local Provider, and model controls that read, list, cancel, and deliver bounded completion notices.

#### `@deepseek-ai/dsh-jobs`

Defines stable background-job ids, owner isolation, snapshots, reads, waits, cancellation, and completion listeners so producers can run long work while an agent continues its turn.

Composition: Service Definition for `ctx.jobs`, consumed by job producers, Providers, and controllers. Agent, Session, identity branding, invariants, and Cordis are hard peers; no optional dependency is declared. The base bundle ships it with local Provider and tools.

Model effect — current agent, indirect: producer and controller Consumers own all result rendering. The in-process callback contract cannot directly support durable cross-process execution, and stream output has only one consuming cursor. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/jobs/jobs/README.md)

#### `@deepseek-ai/dsh-jobs-local`

Runs and stores owner-fenced background jobs in memory, returns detached snapshots, enforces a configurable per-owner live-job cap, and drains owned work during Agent or service disposal.

Composition: Service Provider for `ctx.jobs`, consuming Agent, Scope, Timeout, and the Jobs Definition. Those services and Cordis are hard peers; no optional dependency is declared. The base bundle ships it with a ten-job per-owner default.

Model effect — current agent, indirect: producers and `dsh-tool-jobs` own model output and notices. Records die with the process, and a cancel callback that neither settles nor throws can retain capacity and stall teardown. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/jobs/jobs-local/README.md)

#### `@deepseek-ai/dsh-tool-jobs`

Gives an agent `job_output`, `job_list`, and `job_kill`, attaches the controller required by producers, and delivers bounded completion notices to agents by injection or capped idle-agent wakeups.

Composition: Consumer of Jobs, Tools, Agent, LLM, Output Retention, and System Prompt, registering three schemas, guidance, controller, and delivery listener. Those services and Cordis are hard peers; no optional dependency is declared. Standard shipped presets enable it.

Model effect — current agent, direct: guidance, three schemas, reads, and completion notices enter context; idle notices may open capped extra turns. Notices can strand in the loop's retirement window, and stream reads support one consumer. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/jobs/tool-jobs/README.md)

### experimental

The [experimental package group](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/experimental/README.md) contains private, source-checkout-only capabilities that run on the real harness but carry no stability or release promise, including Agent Teams, its Web controls, and cross-realm runtime inspection.

#### `@deepseek-ai/dsh-experimental-agent-team`

Turns one coding session into a durable team whose Lead creates named teammates, exchanges exactly-once queued messages, and coordinates revision-checked tasks on a shared board across restarts.

Composition: Experimental Service Provider for `ctx.agentTeams`, consuming Agent, Session, persistence, projection, LLM, and Subagent capabilities. Those services and Cordis are hard peers; no optional dependency is declared. It is opt-in, private, and requires durable session storage.

Model effect — recipient agent, direct: each delivered peer message becomes a user-role message with sender and stable message id. Members share one checkout, and mailbox exactly-once behavior does not support concurrent Host processes. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/experimental/agent-team/README.md)

#### `@deepseek-ai/dsh-experimental-client-ui-agent-team`

Adds a Web conversation-header panel for inspecting the Team roster, navigating to teammate conversations, and creating or revision-safely updating shared task-board entries through generated Remotes.

Composition: Experimental Browser Consumer of Agent Teams Remotes, Session Controller, Locale, Conversation, and UI Primitives, contributing roster and task controls. Those capabilities and Cordis are hard peers; no optional dependency is declared. The source-checkout Agent Team Web profile enables it.

Model effect — current agent, none: the browser projection registers no model-facing input. State refreshes only on open, explicit refresh, or mutation, and the panel cannot spawn, rename, delete, or interrupt teammates. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/experimental/client-ui-agent-team/README.md)

#### `@deepseek-ai/dsh-experimental-inspector`

Lets developers inspect a running Host and browser Clients in Chrome DevTools, exposing console contexts, Host debugging and fetch capture, Client runtime inspection, sources, and shared Cordis trees.

Composition: Experimental dual-realm Service Provider for `ctx.inspector`, consuming Loader, Client Modules, and Host Webserver, with a Worker retaining CDP state. Those capabilities and Cordis are hard peers; no optional dependency is declared. It is opt-in and private.

Model effect — current agent, none: observation does not alter model requests. Client script debugging is read-only and incomplete, fetch capture misses retained or direct Undici calls, and an unexpected Worker exit has no automatic restart. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/experimental/inspector/README.md)

#### `@deepseek-ai/dsh-experimental-tool-agent-team`

Gives every Team member ten tools for creating teammates, messaging, waiting, interrupting, and managing the shared task board, plus fixed policy that requires explicit user-requested team formation.

Composition: Experimental Consumer of `ctx.agentTeams`, Tools, Agent, Session, and System Prompt, registering scoped schemas and policy. Those capabilities and Cordis are hard peers; no optional dependency is declared. It is opt-in beside the Team Provider and durable storage.

Model effect — current or child team agent, direct: each member receives Team policy and ten schemas, while results append roster, task, wait, or receipt data. Prompt coordination cannot confine Bash or external writers. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/experimental/tool-agent-team/README.md)

### workflow

The [workflow package group](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/workflow/README.md) runs model-authored JavaScript orchestration over replaceable engines, with a worker-thread Provider and two foreground model Consumers for general fan-out and fixed fresh-agent iteration.

#### `@deepseek-ai/dsh-tool-ralph`

Gives the model a fixed foreground Ralph loop that hands one immutable objective through fresh child agents, carrying only each previous bounded report until completion, a blocker, or the round cap.

Composition: Consumer of Workflow, Subagent, Tools, Agent, and System Prompt, registering the `ralph` schema, routing policy, and fixed script. Those services and Cordis are hard peers; no optional dependency is declared. Standard shipped agent presets enable it.

Model effect — child and current agents, direct: each round pays a fresh child prompt, while the parent receives one terminal report. Completion is worker self-declaration, execution is foreground, and only round count bounds aggregate effort. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/workflow/tool-ralph/README.md)

#### `@deepseek-ai/dsh-tool-workflow`

Gives the model a configurable `workflow` tool that accepts JavaScript orchestration, identity metadata, and arguments, waits for fan-out to settle, and returns one bounded final JSON value.

Composition: Consumer of `ctx.workflowEngine`, Tools, Agent, Session, and System Prompt, registering guidance, one schema, durable top-level records, and result rendering. Those services and Cordis are hard peers; no optional dependency is declared. Standard shipped presets enable it.

Model effect — current agent, direct: fixed guidance, a substantial schema, the authored script, and bounded result remain in context. The parent turn blocks until settlement, and cancellation returns an error without partial output. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/workflow/tool-workflow/README.md)

#### `@deepseek-ai/dsh-workflow`

Defines live workflow runs whose JavaScript scripts can start subagents, combine independent work, narrate phases, and resolve with a final JSON value under holder-owned cancellation and disposal.

Composition: Service Definition for `ctx.workflowEngine` and owner of workflow run vocabulary and events. Agent, Session, and LLM are hard peers with Cordis; no optional dependency is declared. Shipped agent presets pair it with the worker-thread Provider and tool Consumers.

Model effect — current and child agents, indirect: engine and tool Consumers own child prompts and the parent result. Runs have no journaling or resume, no background collection, and no saved or nested workflows. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/workflow/workflow/README.md)

#### `@deepseek-ai/dsh-workflow-worker-thread`

Executes each orchestration script in a fresh Node worker thread while bridging `agent()` calls to Host subagents, keeping synchronous script work off the Host event loop and making cancellation terminable.

Composition: Service Provider for `ctx.workflowEngine`, consuming Workflow, Subagent, Tools, Agent, Session, and LLM. Those services and Cordis are hard peers; no optional dependency is declared. Standard shipped agent presets mount it with provider `spawn`.

Model effect — child agent, direct: each `agent()` sends its prompt and optional schema to an independent child context. The Worker and `node:vm` provide containment, not security; escaped scripts recover process authority. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/workflow/workflow-worker-thread/README.md)

### webhook

The [webhook package group](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/webhook/README.md) turns authenticated external deliveries into trusted rule executions that may create ordinary root sessions, with process-local fire-and-forget dispatch and no delivery queue or retries.

#### `@deepseek-ai/dsh-webhook`

This host runtime registers trusted programmatic rules, dispatches normalized provider deliveries, and creates an ordinary root session inside a Web workspace when a matching rule returns a prompt.

Composition: Service Definition and provider at `ctx.webhookRuntime`, consuming agent, presets, permissions, workspace, session, title, model-default, and LLM services; these are hard peers. It is opt-in through webhook deployments.

Model effect — recipient agent, direct: the rule-authored prompt becomes its initial user message; dispatch is process-local and loses unadmitted work on crashes without replay or retry. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/webhook/webhook/README.md)

#### `@deepseek-ai/dsh-webhook-github`

This GitHub adapter bounds and verifies signed raw JSON on one exact HTTP route, normalizes the delivery, dispatches it, and immediately returns HTTP 202 to the caller.

Composition: Provider adapter consuming `ctx.webhookRuntime`, `ctx.webServer`, and credentials; webhook, webserver, credentials, session, and invariants are hard peers. It is opt-in in the GitHub review example.

Model effect — recipient agent, indirect: only a matching rule's prompt reaches the new session; this adapter provides no TLS and expects a reverse proxy or tunnel. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/webhook/webhook-github/README.md)

### web

The [web package group](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/web/README.md) provides one search-and-fetch service, interchangeable search and HTTP fetch providers, and stable model tools; the base composition selects DeepSeek search and anonymous HTTP fetch.

#### `@deepseek-ai/dsh-tool-web`

This consumer exposes independently configurable `web_search` and `web_fetch` tools, labels results as external untrusted data, converts safe textual pages, and keeps schemas stable when providers are unavailable.

Composition: Consumer that contributes two tool definitions and prompt guidance through tools and system-prompt; web, LLM, and invariants are hard peers. The base and standard agent presets ship it.

Model effect — current agent, direct: schemas, guidance, bounded results, and failures enter requests; query count alone does not cap provider-internal native searches. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/web/tool-web/README.md)

#### `@deepseek-ai/dsh-web`

This provider-neutral service routes search and fetch requests to one usable backend per operation, centralizing provider selection, cancellation, configuration, normalized results, and structured failures behind one stable interface.

Composition: Service Definition and provider at `ctx.web`, accepting search and fetch backends; LLM and invariants are hard peers. The base bundle ships it with default providers and tools.

Model effect — current agent, indirect: `dsh-tool-web` renders normalized results while this service adds no prompt or schema; provider availability has no separate observation API. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/web/web/README.md)

#### `@deepseek-ai/dsh-web-fetch-http`

This anonymous HTTP provider validates public destinations, pins connections, restricts redirects, bounds bytes and characters, and decodes supported textual content into status-plus-body fetch results for retrieval.

Composition: Service Provider registered on `ctx.web` for fetch operations; web, timeout, and invariants are hard peers. The base bundle ships it as the default fetch backend.

Model effect — current agent, indirect: `dsh-tool-web` renders bounded decoded content; binary data, missing content types, and PDFs are unsupported rather than opportunistically decoded. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/web/web-fetch-http/README.md)

#### `@deepseek-ai/dsh-web-search-deepseek`

This search provider uses DeepSeek's native search within a full auxiliary Messages turn, extracting structured search blocks and failing when credentials or usable blocks are absent.

Composition: Service Provider registered on `ctx.web`; credentials, settings, launch environment, agent, session, web, and invariants are hard peers. The base bundle ships it as default search.

Model effect — current agent, indirect: the agent receives tool-rendered sources while an auxiliary DeepSeek model directly sees each query; every search pays full model-turn latency and tokens. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/web/web-search-deepseek/README.md)

#### `@deepseek-ai/dsh-web-search-exa`

This Exa provider maps keyword or neural search results into portable URLs, titles, first highlights, and publication dates without generating a provider-authored answer or content.

Composition: Service Provider registered on `ctx.web`; web, launch environment, and invariants are hard peers. It is an opt-in search alternative requiring an Exa API key.

Model effect — current agent, indirect: `dsh-tool-web` renders bounded sources; results without any non-blank highlight are dropped, so fewer sources may return than requested. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/web/web-search-exa/README.md)

#### `@deepseek-ai/dsh-web-search-perplexity`

This Perplexity provider returns a generated answer plus structured or URL-only citations through one auxiliary chat-completions request, truncating sources after receipt to the requested bound.

Composition: Service Provider registered on `ctx.web`; web, launch environment, and invariants are hard peers. It is an opt-in search alternative requiring a Perplexity API key.

Model effect — current agent, indirect: the agent receives tool-rendered output while an auxiliary Perplexity model directly sees the query; fallback citations contain only URLs. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/web/web-search-perplexity/README.md)

### attachment

The [attachment package group](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/attachment/README.md) defines immutable durable image references and a local content-addressed provider that normalizes uploads and derives route-specific request versions.

#### `@deepseek-ai/dsh-attachment`

Defines durable provider-independent image admission, lookup, normalization metadata, request-version resolution, and session-visible attachment references used consistently across user prompts, commands, tools, and downstream model adapters.

Composition: Service definition for `attachments`, requiring its storage provider while sessions and LLM adapters consume references; the base composition obtains it through the shipped local provider.

Model effect on current agent: indirect through adapters that send resolved image descriptors and bytes; only PNG, JPEG, WebP, and GIF raster images are accepted. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/attachment/attachment/README.md)

#### `@deepseek-ai/dsh-attachment-local`

Validates, orients, strips metadata, converts image color spaces, and stores normalized images content-addressably under `DSH_HOME`, deriving reusable cached request variants for provider-specific input size limits.

Composition: Attachment service provider requiring the attachment definition and Harness-home paths; the base composition ships it active for all supported applications with no required configuration.

Model effect on current agent: indirect through adapter request descriptors and image bytes; stored images have no garbage collector and remain local to the machine. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/attachment/attachment-local/README.md)

### spill

The [spill package group](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/spill/README.md) keeps oversized tool text retrievable by separating storage, a private local-filesystem Provider, and a best-effort policy that replaces large model-facing results with bounded previews and locators.

#### `@deepseek-ai/dsh-spill`

Defines `ctx.spillStore.saveText()` so callers can persist oversized text at runtime and receive an opaque locator, exact byte count, and backend-owned retrieval guidance without prescribing storage.

Composition: Service Definition for `ctx.spillStore`, consumed by backends and spill policies. Session, LLM, branding, invariants, and Cordis are hard peers; no optional dependency is declared. The base bundle ships it with local storage and result policy.

Model effect — current agent, indirect: Consumers decide whether to render the locator and guidance. The Definition exposes no retrieval or deletion API, and each backend or retrieval Consumer must enforce locator access independently. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/spill/spill/README.md)

#### `@deepseek-ai/dsh-spill-local`

Stores oversized text in private, unpredictable, Session-scoped Host files and returns paths with read-or-grep guidance for later retrieval while resisting shared-root leakage and planted-symlink redirection.

Composition: Service Provider for `ctx.spillStore`, requiring the Spill Definition, invariants, and Cordis, with no optional dependency. The base bundle ships it for co-located agents; configuration owns the root and startup retention sweep.

Model effect — current agent, indirect: spill Consumers expose its path and retrieval guidance. Cleanup runs only at startup, and locators are useful only where the model's filesystem tools can reach the Host path. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/spill/spill-local/README.md)

#### `@deepseek-ai/dsh-spill-policy`

Replaces oversized final plain-text tool results with a bounded head-and-tail preview, stored-result locator, and retrieval hint in history, while leaving the original visible when spilling fails.

Composition: Consumer of Spill, Tools, Output Retention, Session, and LLM, registering result listeners rather than a service. Those capabilities and Cordis are hard peers; no optional dependency is declared. The base bundle ships it with a 50,000-byte cap.

Model effect — current agent, direct: successful replacement appends only the bounded preview and locator. Mixed content, blocked feedback, `read`, and earlier provider truncation are unspillable; an oversized notice can force the original result inline. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/spill/spill-policy/README.md)

### todo

The [todo package group](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/todo/README.md) owns the durable model-facing task-list tool and its event projection, allowing an agent and UI to share current work status across turns and resumed sessions.

#### `@deepseek-ai/dsh-tool-todo`

Gives an agent a structured `todo_write` tool for replacing its pending, active, and completed task list, with durable events and projection state visible after resume.

Composition: Tool and session-projection consumer requiring agents, sessions, projections, and tools; the base composition ships it, and standard, PTC, and Cordis presets activate it for selected agents.

Model effect on current agent: direct through schema, planning guidance, calls, and retained results; each list belongs to one agent session and has no shared or swarm ownership. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/todo/tool-todo/README.md)

### plan

The [plan package group](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/plan/README.md) provides logged per-agent planning state, deployment-owned guidance, human command entry and exit, and a reviewed tool exchange before execution resumes.

#### `@deepseek-ai/dsh-plan-mode`

Guides an agent to explore and design before acting, lets users enter or leave with `/plan`, and requires the agent's finished Markdown plan to pass an interactive review.

Composition: Service Provider and Consumer across Agent, Session projection, System Prompt, Tools, and User Questions, with Commands optional, contributing `ctx.planMode`, `/plan`, policy, projection, and `exit_plan_mode`. The required services and Cordis are hard peers. Standard shipped presets enable it.

Model effect — current agent, direct: active mode adds deployment guidance and the exit schema mediates review results. Guidance does not enforce read-only behavior, pending selections are process-local, and live owned children cannot open review. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/plan/plan-mode/README.md)

### preset

The [preset package group](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/preset/README.md) owns per-session plugin compositions selected from `agent.cordis.yml` files and the scoped persona row that can replace deployment prompt identity for one preset.

#### `@deepseek-ai/dsh-agent-presets`

Discovers preset directories and keeps every agent joined to one standing scoped composition that supplies its tools, prompt sections, persona, and skills across the session.

Composition: Orchestrator and `agentPresets` service provider requiring agents, sessions, prompts, tools, settings, and projections; the Web application ships it with `standard` as the default preset.

Model effect on current agent: indirect through the selected preset's plugins; a session can switch presets only before producing any message or tool call. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/preset/agent-presets/README.md)

#### `@deepseek-ai/dsh-persona`

Registers a preset-scoped deployment persona, optionally replacing the complete system prompt, so agents sharing one deployment can receive different identity and behavioral instructions per preset.

Composition: Scoped system-prompt contributor requiring the prompt registry and an agent scope; minimal, standard, PTC, and Cordis presets ship it, while global mounting fails on the owned persona slot.

Model effect on current agent: direct through configured persona text and variable expansion; the row cannot mount globally because the prompt registry already owns the unscoped deployment persona. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/preset/persona/README.md)

### guard

The [guard package group](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/guard/README.md) keeps loops productive through advisory repeated-call reminders and cooperative per-tool deadlines; both plugins ship enabled in the base bundle and remain configurable or removable.

#### `@deepseek-ai/dsh-repeat-tool-reminder`

This guard tracks identical consecutive tool calls per agent and appends progressively stronger reminders at configured thresholds without blocking a legitimate repeat or delaying execution.

Composition: Consumer of agent and tool events that contributes durable reminder context; agent, tools, and invariants are hard peers. The base bundle ships thresholds at three, five, and eight repeats.

Model effect — current agent, direct: threshold reminders enter retained history for that agent; deep key sorting detects exact arguments only, so near-identical variants evade the chain. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/guard/repeat-tool-reminder/README.md)

#### `@deepseek-ai/dsh-tool-call-timeout-policy`

This zero-configuration guard arms declared per-tool deadlines, signals cooperative cancellation, and maps a settled timeout to a concise structured error instead of leaving the session indefinitely stalled.

Composition: Consumer that wraps `ctx.tools` execution; tools, timeout, LLM, and invariants are hard peers. The base bundle ships it, while each tool owns whether and how long a deadline applies.

Model effect — current agent, indirect: a settled timeout becomes a retained tool error; a downstream tool that ignores cancellation still blocks until it eventually settles. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/guard/timeout-policy/README.md)

### extensions

The [extensions package group](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/extensions/README.md) lets agents define, inspect, run, stop, and remove process-memory Cordis packages with host and browser halves; definitions vanish on restart and never modify repository configuration.

#### `@deepseek-ai/dsh-client-ui-cordis`

This Web UI provides a global dynamic-package panel, lifecycle tool cards, and `@pluginId` completion over host definitions and browser-runner state without authoring new conversation content.

Composition: Browser Consumer requiring slots, locale, input triggers, Remote dynamic-runner methods, and the Client dynamic runner, then contributing panel, card, and input-source slots. The Web bundle ships it alongside both runners, while model tools remain preset-controlled.

Model effect — current agent, indirect: UI gestures invoke runner lifecycle verbs, but the UI writes no session event; a continuously open panel can miss unannounced definition-only registry changes. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/extensions/ui-cordis/README.md)

#### `@deepseek-ai/dsh-cordis-client-runner`

This browser runner evaluates and activates a dynamic package's client half after user approval, reports its run resolution to the host, and retracts it when stopped.

Composition: Browser Service Provider for `ctx.dynamicCordisRunner`, requiring Loader, modules, slots, Remote, and Remote dynamic-runner methods. The Web bundle ships it dormant until a page answers a dynamic run request.

Model effect — current agent, indirect: host-relayed run resolutions and render failures can enter results or steering; a stale refused resolution is not automatically retried or unloaded. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/extensions/cordis-client-runner/README.md)

#### `@deepseek-ai/dsh-cordis-host-runner`

This host runner stores dynamic definitions in memory, evaluates host halves in a Node VM, coordinates browser approval, and exposes live runtime inspection and lifecycle operations.

Composition: Service Provider for `ctx.dynamicCordisRunner` and `ctx.cordisInspect`; agent, session, tools, LLM, scoping, protocol, and invariants are hard peers. The Web bundle ships it by default.

Model effect — current agent, indirect: lifecycle outcomes and diagnostics reach tool results or steering; a successful run can precede a later browser-render crash. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/extensions/cordis-host-runner/README.md)

#### `@deepseek-ai/dsh-tool-cordis`

This model toolset inspects the live Cordis process and defines, versions, runs, stops, or removes dynamic host and browser packages without installing dependencies or editing configuration.

Composition: Consumer that contributes seven tools and workflow guidance over the host runner; runner, agent, session, tools, prompt, LLM, scoping, and invariants are hard peers. It is opt-in through the Cordis preset.

Model effect — current agent, direct: schemas, guidance, submitted code, results, and running-package contributions enter requests; the Node VM is honest-code containment, not a security boundary. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/extensions/tool-cordis/README.md)

### hooks

The [hooks package group](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/hooks/README.md) maps existing Claude Code or Codex command-hook configurations onto native interception points, preserving supported blocking, context injection, and forced-continuation behavior without rewriting hooks as plugins.

#### `@deepseek-ai/dsh-hooks-claude-code`

Runs supported Claude Code command hooks at Session, prompt, Tool, stop, and subagent lifecycle points, allowing existing configuration to block actions, attach context, request approval, or continue a run.

Composition: Interception Consumer of Agent, LLM, Session, persistence, projection, Subagent, Tools, and the shared hook protocol. Those capabilities and Cordis are hard peers; no optional dependency is declared. It is opt-in through a configured hook-file path.

Model effect — current or child agent, direct: supported hooks can append attributed context, replace denied outcomes, or steer another step. Only seven current Claude Code events and shell-form handlers are supported, with several payload fields omitted. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/hooks/hooks-claude-code/README.md)

#### `@deepseek-ai/dsh-hooks-codex`

Runs five supported Codex command-hook events during Session start, prompt submission, Tool execution, and stopping, preserving configured blocking, context injection, feedback, and forced continuation where mapped.

Composition: Interception Consumer of Agent, LLM, Session, persistence, projection, Tools, and the shared hook protocol. Those capabilities and Cordis are hard peers; no optional dependency is declared. It is opt-in through one process-level `hooks.json` path.

Model effect — current agent, direct: hooks may append context, replace denied outcomes, or force a next step. Permission, compaction, and subagent events are unsupported, and non-shell or asynchronous handlers do not run. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/hooks/hooks-codex/README.md)

### session

The [session package group](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/session/README.md) makes conversations durable, derives client-facing state and titles from their logs, and can export session activity; JSONL persistence is the shipped backend, while SQLite and alternative title policies remain selectable.

#### `@deepseek-ai/dsh-session-checkpoint-policy`

This zero-configuration policy flushes persisted sessions before model requests, before top-level tools can create external effects, and at step boundaries, preserving recorded intent and completed work across crashes.

Composition: Consumer that wraps the LLM and tool pipelines and contributes durability checkpoints; it requires agent, session, persistence, LLM, tools, and invariants. The base bundle ships it beside JSONL persistence.

Model effect — current agent, indirect: successful checkpoints add nothing, while recovery can append an unknown-outcome tool result; checkpoints cannot guarantee exactly-once external effects. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/session/session-checkpoint-policy/README.md)

#### `@deepseek-ai/dsh-session-log-deepseek`

This plugin uploads the incremental canonical session-log suffix as official DeepSeek request metadata and durably records the provider acceptance watermark used to select the next suffix.

Composition: Consumer of session and DeepSeek API-extension services that contributes `dsh_session_log` metadata and an acceptance event; those services and invariants are hard peers. Base and SDK-minimal compositions ship it.

Model effect — current agent, none: the metadata is outside messages, prompt, and schemas, but a crash after provider acceptance can cause a conservative duplicate upload. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/session/session-log-deepseek/README.md)

#### `@deepseek-ai/dsh-session-persistence`

This backend-neutral service durably stores and reloads append-only session events, lists stored sessions, coordinates safe writes, and repairs interrupted turns without maintaining a separate message representation.

Composition: Service Definition for `ctx.sessionPersistence`, with shared write coordination and recovery semantics; session, branding, timeout, and invariants are hard peers. Shipped compositions obtain it through the selected persistence provider.

Model effect — current agent, indirect: resume restores retained history and may add risk-specific repair results; the service has no deletion or retention API. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/session/session-persistence/README.md)

#### `@deepseek-ai/dsh-session-persistence-jsonl`

This provider durably stores each session as an append-only JSONL artifact, using checksummed Zstandard frames by default or readable newline-delimited records when compression is disabled.

Composition: Service Provider registered on `ctx.sessionPersistence`; Session is its required service peer. The base and SDK-minimal bundles ship it as the default backend.

Model effect — current agent, indirect: restored logical history and crash repairs reach later requests, but the configured encoding and current pre-release session format must match. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/session/session-persistence-jsonl/README.md)

#### `@deepseek-ai/dsh-session-persistence-sqlite`

This alternative provider keeps every session log in one queryable SQLite database, packing compatible records while preserving the same logical events, replay, and recovery behavior.

Composition: Service Provider registered on `ctx.sessionPersistence`; Session is its required service peer. The shipped Karaka harness selects it, while other shipped compositions retain JSONL unless they opt in.

Model effect — current agent, none: resume restores the same logical history as JSONL with no SQLite-specific input; the pre-release schema has no migration guarantee. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/session/session-persistence-sqlite/README.md)

#### `@deepseek-ai/dsh-session-projection`

This registry folds committed session events into schema-validated whole values that client history pages and push frames can consume without independently replaying the raw log.

Composition: Service Definition and provider for `ctx.sessionProjections`, accepting pure projection units and publishing finished values; session and invariants are hard peers. Base and SDK-minimal compositions ship it.

Model effect — current agent, none: projections only expose already-logged state to clients; every tail page carries every client-visible registered key without per-key opt-out. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/session/session-projection/README.md)

#### `@deepseek-ai/dsh-session-projection-cache`

This plugin checkpoints every registered projection unit into versioned per-session domain records, allowing synchronous list reads and cold folds to skip a known log prefix.

Composition: Consumer of session projections and `ctx.storageDomain` that provides `ctx.sessionProjectionCache`; session, projection, storage-domain, and invariants are hard peers. The base bundle ships it over JSON storage.

Model effect — current agent, none: cached state accelerates host reads without entering requests; records accumulate because the cache exposes no eviction or retention operation. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/session/session-projection-cache/README.md)

#### `@deepseek-ai/dsh-session-stats`

This projection computes whole-log turn, step, LLM, tool, first-token, and decode timing figures for clients that remain stable across all paging and conversation compaction operations.

Composition: Consumer that contributes the `sessionStats` unit to `ctx.sessionProjections`; session, projection, LLM, and invariants are hard peers. The shipped Web bundle mounts it for its statistics display.

Model effect — current agent, none: figures are client-facing folds of logged boundaries; attempted steps count even when they fail before producing visible output. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/session/session-stats/README.md)

#### `@deepseek-ai/dsh-session-telemetry-otel`

This provider sends session records through OpenTelemetry logs in full, feedback-gated, or disabled mode, delegating batching, retry, queueing, and loss behavior to the OTel SDK.

Composition: Service Provider for the session-telemetry capability and Consumer of session, feedback, identity, and LLM events; those services and invariants are hard peers. The base bundle ships feedback-gated telemetry.

Model effect — current agent, none: telemetry never assembles provider input, but exporting beyond a trusted destination requires deployment-owned redaction because complete post-waterfall event data can leave the machine. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/session/session-telemetry-otel/README.md)

#### `@deepseek-ai/dsh-session-title`

This service gives each session a deterministic fallback, an optional asynchronously generated title, or an explicit user rename, recording every accepted revision only in the session log.

Composition: Service Definition and scheduler for `ctx.sessionTitle`, plus a projection unit; agent, session, projection, and LLM are hard peers. The base bundle ships it with a model-backed provider.

Model effect — current agent, none: title events never enter derived messages or request prefixes; the service provides no title deletion, search, or list indexing. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/session/session-title/README.md)

#### `@deepseek-ai/dsh-session-title-all-prompts-llm`

This optional title provider summarizes all eligible human messages after each new prompt, superseding stale revisions and sharing routing, prompt, budget, and cancellation policy with title infrastructure.

Composition: Service Provider registered on `ctx.sessionTitle`; title, shared title-LLM policy, session, LLM, and invariants are hard peers. It is opt-in instead of the shipped first-prompt provider.

Model effect — current agent, none: an auxiliary title model directly reads bounded human-message history; input overflow retains the prior title rather than summarizing summaries. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/session/session-title-all-prompts-llm/README.md)

#### `@deepseek-ai/dsh-session-title-first-prompt-llm`

This title provider summarizes only the first eligible human message for a fresh, non-fork session, retaining the fallback on failure until an explicit refresh retries generation.

Composition: Service Provider registered on `ctx.sessionTitle`; title, shared title-LLM policy, session, LLM, and invariants are hard peers. The base bundle ships it as the default title source.

Model effect — current agent, none: an auxiliary title model directly reads only the first eligible prompt; that title can become unrepresentative as a session evolves. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/session/session-title-first-prompt-llm/README.md)

### session-query

The [session-query package group](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/session-query/README.md) separates trusted programmatic history reads, optional SQLite full-text indexing, browser ZIP export, and workspace-authorized model tools over live and durable Session records.

#### `@deepseek-ai/dsh-session-log-export`

Lets Web users download a Session, its descendants, and attachments as a ZIP through either a Session-header button or the `/export` command, with browser-owned destination and progress feedback.

Composition: Dual-face Consumer of Connection, Commands, Session Query, persistence, attachments, and Web conversation services, contributing an authenticated archive route and browser controls. Those capabilities and Cordis are hard peers; no optional dependency is declared. The Web bundle ships it.

Model effect — current agent, none: `/export` stays on the human-command plane and creates no model turn. Export requires a per-Session raw-artifact backend; shipped SQLite persistence cannot provide that archive. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/session-query/session-log-export/README.md)

#### `@deepseek-ai/dsh-session-query`

Gives trusted code one service for complete logs, Session lists and filters, title folding, bounded event reads, lineage and relationship traces, and pluggable full-text search.

Composition: Service Definition and default Provider for `ctx.sessionQuery`, requiring Session while optionally consuming persistence, title, projection, and cache capabilities and delegating ranked search. Cordis and Session are hard peers. The base bundle ships it.

Model effect — current agent, none: cloned records reach callers only. The service performs no authorization, and exact reads and traces replay the complete logical log, so model or UI Consumers must constrain access and cost. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/session-query/session-query/README.md)

#### `@deepseek-ai/dsh-session-query-sqlite`

Adds ranked, cursor-paginated FTS5 search across live and persisted Session history while retaining the base service's exact reads, filters, and traces and keeping its index separate from persistence.

Composition: Service Provider extending `ctx.sessionQuery` through the required Session and query Definition services, with persistence optional. Those required capabilities and Cordis are hard peers. The base bundle ships it with `openAt: never`, so search needs an enabling overlay.

Model effect — current agent, none: hits return only to callers. Synchronous SQLite MATCH blocks the JavaScript thread, token search does not find arbitrary substrings, and one process must exclusively own each derived-index path. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/session-query/session-query-sqlite/README.md)

#### `@deepseek-ai/dsh-tool-session-query`

Gives the model five read-only tools for searching prior Sessions, tracing lineage and event relationships, and reading exact events, limited to Sessions whose recorded workspace matches the caller.

Composition: Consumer of Session Query, Agent, Session, Projection, Tools, System Prompt, and Timeout, registering five schemas plus guidance. Those services and Cordis are hard peers; no optional dependency is declared. It is opt-in and absent from shipped Host compositions.

Model effect — current agent, direct: a fixed guidance section, five schemas, and data-dependent results enter context. Search caps expose no continuation, exact-string `cwd` defines authority, and custom compositions without Spill may return large inline payloads. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/session-query/tool-session-query/README.md)

### settings

The [settings package group](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/settings/README.md) layers user-editable namespace values over schema defaults and deployment configuration, with a shipped YAML or JSON document provider that publishes valid changes live.

#### `@deepseek-ai/dsh-settings`

This service lets plugins register schema-backed namespaces, resolve defaults plus composition and user layers, observe committed changes, expose client-safe descriptors, and reject revision-stale writes per namespace.

Composition: Service Definition at `ctx.settings`, requiring a provider for persistence; session, branding, schema, and invariants are hard peers. The base bundle obtains it through `settings-file`.

Model effect — current agent, indirect: consumers decide whether resolved settings alter requests; resolution supports one user layer and does not preserve per-field provenance across all sources. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/settings/settings/README.md)

#### `@deepseek-ai/dsh-settings-file`

This provider stores all user settings namespaces in one YAML or JSON document, hot-publishes valid external edits, and preserves untouched YAML comments, anchors, formatting, and unloaded sections.

Composition: Service Provider for `ctx.settings`; settings, home paths, atomic writes, and invariants are hard peers. The base bundle ships it at the harness-home settings document.

Model effect — current agent, indirect: consumers own any request change; concurrent edits to the same namespace remain last-write-wins without per-value merging or revision checks. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/settings/settings-file/README.md)

### credentials

The [credentials package group](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/credentials/README.md) resolves named secrets and durable plugin credentials without embedding values in configuration, ships a private local provider, and supports opt-in human authorization flows.

#### `@deepseek-ai/dsh-authorization`

This service runs plugin-registered human authorization flows, routes notices and questions to the initiating page, and reports success only after observing the resulting credential-record commit.

Composition: Service Definition and attempt coordinator at `ctx.authorization`, consuming `ctx.credentials`; credentials, LLM, and invariants are hard peers. It is opt-in and ships no authorization flows by itself.

Model effect — current agent, none: authorization is a human configuration interaction; attempts are process-local and cannot resume after a browser reload or host restart. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/credentials/authorization/README.md)

#### `@deepseek-ai/dsh-credentials`

This service resolves named secret references per operation and stores durable plugin credential records, while client-safe status describes presence, source, and mutability without exposing secret values.

Composition: Service Definition at `ctx.credentials`, implemented by a concrete store; invariants is its key hard peer. The base composition receives it through the shipped local provider.

Model effect — current agent, indirect: consuming adapters decide what a resolved value enables, while values never enter request prefixes; named references have no enumeration API. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/credentials/credentials/README.md)

#### `@deepseek-ai/dsh-credentials-local`

This default local provider merges launch-environment, private managed-file, project `.env`, and home `.env` sources in fixed precedence and live-reloads durable key and plugin records without restart.

Composition: Service Provider for `ctx.credentials`; credentials, home paths, launch environment, atomic writes, and invariants are hard peers. The base bundle ships it with a private harness-home document.

Model effect — current agent, indirect: adapters consume resolved values without exposing them; concurrent writes to the same reference are last-write-wins despite serialized document updates. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/credentials/credentials-local/README.md)

### storage

The [storage package group](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/storage/README.md) provides optional host-side durability for non-session records through a backend hub, schema-validated domains, readable JSON files, or a point-update SQLite database.

#### `@deepseek-ai/dsh-storage`

This hub connects registered durable backends with data-form facilities so host packages can persist non-session application state without coupling their semantics to a storage medium.

Composition: Service Definition and registration provider at `ctx.storage`; invariants is its key hard peer. The base bundle ships it with JSON and domain plugins, while compositions without durable app data may omit it.

Model effect — current agent, none: the host-only registry adds no prompt, tool, or event; its backend contract currently supports only key-value data, not session logs. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/storage/storage/README.md)

#### `@deepseek-ai/dsh-storage-domain`

This typed data form opens named, versioned, schema-validated domains over routed backends, serves synchronous authoritative reads, and emits a change event only after durable writes complete.

Composition: Consumer of `ctx.storage` and Service Provider at `ctx.storageDomain`; storage and invariants are hard peers. The base bundle ships it over JSON for workspace and session-sidecar consumers.

Model effect — current agent, none: domain state and in-process change events remain host-side; changes made by another host process are not observed live. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/storage/storage-domain/README.md)

#### `@deepseek-ai/dsh-storage-json`

This backend durably stores each unit as one readable JSON document or as version-stamped per-record documents, atomically publishing every changed file beneath a configured root.

Composition: Service Provider registered as backend `json` on `ctx.storage`; storage and invariants are hard peers. The base bundle ships it as the default backend for domain data.

Model effect — current agent, none: persisted domain records never enter requests; the `single` layout rewrites a unit's complete file on every write. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/storage/storage-json/README.md)

#### `@deepseek-ai/dsh-storage-sqlite`

This backend keeps all routed units in one SQLite database and stores each record as a JSON row, making high-frequency point updates touch only one row.

Composition: Service Provider registered as backend `sqlite` on `ctx.storage`; storage and invariants are hard peers. It is an opt-in alternative to the base bundle's readable JSON backend.

Model effect — current agent, none: persisted domain records stay host-side; the synchronous SQLite driver blocks the JavaScript event loop for each statement. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/storage/storage-sqlite/README.md)

### workspace

The [workspace package group](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/workspace/README.md) owns durable, ordered project records and validated Session membership for Host product surfaces while remaining entirely outside tools, prompts, Session events, and the agent loop.

#### `@deepseek-ai/dsh-workspace`

Gives Host surfaces persistent named directory projects, stable ordering, validated Session grouping, archival display filtering, and safe project removal that never deletes folders, files, or Session histories.

Composition: Service Provider for `ctx.workspaceRegistry`, consuming Session, persistence, Storage, domain storage, and Typert protocol. Those services and Cordis are hard peers; no optional dependency is declared. The shipped Web bundle mounts it; headless compositions may omit it.

Model effect — current agent, none: workspace records create no tools, prompts, or Session events. Removal never deletes data, archival has no unarchive operation, and external directory damage is detected only on refresh or restart. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/workspace/workspace/README.md)

### sdk

The [sdk package group](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/sdk/README.md) lets another process drive a harness runtime over the shared newline-delimited JSON-RPC protocol; this package-reference shard covers the stdio server used by TypeScript and Python clients.

#### `@deepseek-ai/dsh-sdk-jsonrpc-server`

Serves SDK JSON-RPC over stdio, creates one agent per Session id, queues prompts, streams Session events and lifecycle status, validates routes, and shuts the composed runtime down cleanly.

Composition: Protocol Consumer of Agent, Session, Attachment, LLM, Scope, SDK Protocol, and Subagent capabilities, contributing the `jsonrpc` stdio server. Those services and Cordis are hard peers; no optional dependency is declared. Shipped SDK profiles enable it.

Model effect — current agent, direct: accepted text and durable content references enter one user message; transport frames add nothing. The wire has no per-Session close or prompt cancellation and returns admission ids, not per-prompt results. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/sdk/server/README.md)

### acp

The [acp package group](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/acp/README.md) exposes persistent harness agents to trusted automation through standard Agent Client Protocol JSON-RPC over stdio, including Sessions, MCP tools, model selection, prompts, permissions, updates, cancellation, and close.

#### `@deepseek-ai/dsh-acp`

Lets trusted programs create, resume, list, prompt, cancel, and close persistent agents over ACP, attach MCP servers, choose models, answer permissions, and receive semantic execution updates.

Composition: Protocol Consumer of Agent, Session persistence, attachments, LLM, MCP Client, and User Approval, with Token Meter optional, contributing a stdio ACP server. The required capabilities and Cordis are hard peers. The shipped `acp` profile enables it.

Model effect — current agent, direct: accepted text, images, and resource-link references become ordered user-message content. The server supports one primary workspace, raster prompt images, and MCP tools only, with no transcript replay or interactive extensions. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/acp/acp/README.md)

### interaction

The [interaction package group](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/interaction/README.md) separates direct human slash commands, question and approval services, permission presets, and the model tool that pauses an active turn for structured user input.

#### `@deepseek-ai/dsh-commands`

Lets plugins register agent-scoped or global slash commands that interactive adapters discover and execute directly, recording each run without turning ordinary command input or output into model history.

Composition: Command registry requiring agent and session context, with attachment admission and Typert discovery integrations; the base composition ships it, and Web or CLI adapters provide user-facing dispatch.

Model effect on current agent: none by default because command results stay in the UI plane; inputs are unstructured text, so typed forms and completion remain command-owned concerns. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/interaction/commands/README.md)

#### `@deepseek-ai/dsh-permission-presets`

Combines sandbox mode and approval policy into named user-facing permission presets while retaining each underlying setting, session event, enforcement owner, and custom unmatched state independently.

Composition: Policy orchestrator requiring shell, approval, sessions, and session projections, with settings and command contributions conditional. The base and Web compositions ship its service, projection, and optional command surfaces.

Model effect on current agent: indirect through approval context and sandboxed tool outcomes; presets bundle only sandbox and approval knobs, not agent profiles or broader authority choices. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/interaction/permission-presets/README.md)

#### `@deepseek-ai/dsh-tool-ask-user`

Gives a root agent one `ask_user_question` tool that presents structured questions with selectable options, waits for the first scoped answerer, and returns accepted answers as compact JSON.

Composition: Tool consumer requiring tools and the user-questions service; the live calling Agent is execution-time authority, not a service dependency. Standard, PTC, and Cordis presets ship it, while Web contributes the scoped answerer through Remote Events.

Model effect on current agent: direct through schema and retained answer or error; a pending question blocks without its own timeout, and runtime-owned child agents cannot ask. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/interaction/tool-ask-user/README.md)

#### `@deepseek-ai/dsh-user-approval`

Provides fail-closed one-shot allow or reject decisions for sensitive actions, applying each session's ask-or-never policy before composed answerers and recording requests in the session audit log.

Composition: Approval service requiring live agent and session scope, with UI or automation answerers contributed separately; the base composition ships it for sandboxed tools and permission presets.

Model effect on current agent: direct through approval-policy runtime context and asking-tool outcomes; requests are valid only during an open turn, not as durable out-of-turn workflows. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/interaction/user-approval/README.md)

#### `@deepseek-ai/dsh-user-questions`

Defines the scoped service and waterfall request types used when a tool or permission plugin must pause active work until a human answerer accepts and responds.

Composition: Service definition requiring live agent scope for shipped Web routing, with answerers mounted separately; the base composition ships it before the question tool and browser interaction adapter.

Model effect on current agent: indirect through the ask-user tool's retained answers and failures; agentless callers need an unscoped listener, and the question vocabulary excludes richer file or diff pickers. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/interaction/user-questions/README.md)

### host

The [host package group](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/host/README.md) supplies the Web GUI's HTTP and SPA hosting, adaptive workspace-directory selection, and read-only plugin inventory; browser transport and rendering remain in the client group.

#### `@deepseek-ai/dsh-host-directory-picker`

This GUI-host service reports the composed workspace-selection interaction so consumers can use a native operating-system chooser or an in-app directory browser through one extensible vocabulary.

Composition: Service Definition at `ctx.directoryPicker`, consumed by Host workspace flows; invariants is its key hard peer. The shipped Web bundle obtains it through the adaptive picker provider.

Model effect — current agent, none: workspace selection never reaches the agent loop; the browse contract currently exposes one ancestry chain and no multi-root selection. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/host/directory-picker/README.md)

#### `@deepseek-ai/dsh-host-directory-picker-auto`

This boot-time chooser samples bind address, SSH launch markers, and display availability once, then mounts the native or browse host-and-browser backend pair for the process lifetime.

Composition: Assembly runner that contributes real Loader entries; Loader, webserver, both picker backends, both browser interactions, and invariants are hard peers. The Web bundle ships it as the adaptive default.

Model effect — current agent, none: picker selection is host-only; launch-context inference can choose native for an unattended workstation reached later through loopback forwarding. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/host/directory-picker-auto/README.md)

#### `@deepseek-ai/dsh-host-directory-picker-browse`

This remote-safe backend lists one directory level, creates validated child directories, and supplies an in-app workspace chooser without rendering anything on the host display for remote clients.

Composition: Service Provider for the browse `ctx.directoryPicker` interaction and its browser counterpart; invariants is its key hard peer. The shipped adaptive picker selects it when native interaction is unsuitable.

Model effect — current agent, none: directory browsing stays in the workspace UI; Windows hidden attributes are not detected, so only dot-prefixed names receive the hidden flag. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/host/directory-picker-browse/README.md)

#### `@deepseek-ai/dsh-host-directory-picker-native`

This local-display backend opens one platform directory chooser through macOS AppleScript, Linux Zenity or KDialog, or the Windows file-dialog child process, returning a path or cancellation.

Composition: Service Provider for the native `ctx.directoryPicker` interaction and its browser counterpart; invariants is its key hard peer. The shipped adaptive picker selects it only for a viable local display.

Model effect — current agent, none: selection stays in the workspace UI; Linux requires Zenity or KDialog and does not fall back internally to typed-path browsing. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/host/directory-picker-native/README.md)

#### `@deepseek-ai/dsh-host-frontend-static`

This fallback server delivers the built Web shell with fixed index, asset, MIME, method, missing-file, and traversal behavior, rendering successful index responses through startup-input taps.

Composition: Consumer of `ctx.webServer` that owns its single fallback seat and uses client-connection startup data; webserver, connection, and invariants are hard peers. The shipped Web runtime mounts it.

Model effect — current agent, none: it serves browser assets only; its deliberately small MIME table sends unrecognized extensions as `application/octet-stream` by default. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/host/frontend-static/README.md)

#### `@deepseek-ai/dsh-host-plugin-inventory`

This read-only Remote snapshots current non-group Loader entries and, when available, flattened agent-preset compositions with enablement, phase, trust, health, and display metadata for clients and settings pages.

Composition: Consumer of Loader and optional agent-presets that contributes `pluginInventory/list`; Loader, protocol, branding, and invariants are hard peers, while agent-presets is optional. The Web bundle ships it.

Model effect — current agent, none: inventory is a host settings projection; it provides only point-in-time state, without lifecycle history, subscriptions, provenance, or mutation. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/host/plugin-inventory/README.md)

#### `@deepseek-ai/dsh-host-webserver`

This plain Node HTTP carrier accepts named exact and prefix routes, upgrade routes, index startup inputs, and one fallback handler for the browser-facing Web application.

Composition: Service Definition and provider at `ctx.webServer`; route-owning plugins consume it, and invariants is its key hard peer. The Web bundle ships it with host and port configuration.

Model effect — current agent, none: HTTP serving never enters model requests; the server provides no global TLS, authentication, or origin policy for non-loopback exposure. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/host/webserver/README.md)

### client

The [client package group](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/client/README.md) assembles the browser half of the Web GUI from transport, loading, localization, rendering infrastructure, and feature plugins that contribute typed slots without moving presentation state into the agent runtime.

#### `@deepseek-ai/dsh-client-connection`

Carries authenticated browser-to-Host Remote calls, exact Fetch responses, and recoverable connection generations, exposing current Host facts and an immediate reconnect action to the rest of the browser application.

Composition: Browser Service Provider for `ctx.connection` plus Host API routing and generation-source registration. Cordis is required; credentials and Typert/API consumers supply adjacent capabilities, with no optional dependency. The Web bundle ships it as immediate kernel infrastructure.

Model effect — current agent, none: it transports already-composed traffic and never assembles a provider request. The `/api` bridge buffers each request body in memory up to its configured cap. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/client/connection/README.md)

#### `@deepseek-ai/dsh-client-hmr`

Swaps one rebuilt browser plugin into a running development page without reloading the application, preserving connection, runtime, and Session objects while deliberately remounting the edited plugin with fresh component state.

Composition: Browser Consumer and reload driver over Loader entries, invalidation, prefetch, and fiber replacement. Cordis is its only hard peer and no optional dependency is declared. The Web graph ships the row, but rebuild watchers activate its behavior only during development.

Model effect — current agent, none: hot reload changes browser components only and contributes no model-facing data. A failed swap has no rollback and leaves the Loader entry failed until another rebuild. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/client/hmr/README.md)

#### `@deepseek-ai/dsh-client-locale`

Lets Web users switch languages immediately, persists the loopback preference, and gives client plugins a typed dictionary and language-pack registry with browser matching, fallback chains, and live slot-rendered translation updates.

Composition: Browser Service Provider for `ctx.locale` and Consumer of Connection, Remotes, Renderer, and Settings. Cordis and those client capabilities are hard peers; no optional dependency is declared. It ships immediately in the Web bundle with English and Chinese.

Model effect — current agent, none: locale selection changes browser copy only. Text captured by registries outside the slot render path stays in its registration-time language until that contribution registers again. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/client/locale/README.md)

#### `@deepseek-ai/dsh-client-modules`

Turns each `dsh.client` declaration into a served, lazily materialized browser bundle, composing the boot graph on the Host and resolving shared or dynamic module identities in the browser.

Composition: Dual-face Service Provider for the Host plugin graph and browser module table consumed by Loader. Cordis is the hard peer and no optional dependency is declared. The Web bundle ships it as immediate kernel infrastructure before feature plugins activate.

Model effect — current agent, none: module loading is browser-kernel machinery and registers nothing model-facing. The Host retains bundle, map, combo, and recent HMR artifact bytes, so memory grows with composed client artifacts. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/client/modules/README.md)

#### `@deepseek-ai/dsh-client-ui-agent-preset`

Provides the new-session preset chooser, the current session's read-only preset label, and a settings roster for copying, deleting, selecting defaults, and locating editable preset compositions.

Composition: Browser Consumer contributing preset controls to Conversation, Workspace, and Settings slots through Session Controller and Remotes. Those client services and Cordis are hard peers; no optional dependency is declared. It ships in the standard Web roster.

Model effect — current agent in a later session, indirect: a choice determines the preset that composes that later agent, whose packages own all request effects. External file edits do not push roster updates to the page. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/client/ui-agent-preset/README.md)

#### `@deepseek-ai/dsh-client-ui-approval`

Takes over the Web conversation composer for a pending Host approval, optionally shows correlated Tool detail, and returns the user's allow-once or reject decision to the waiting operation.

Composition: Browser Consumer of Remotes, Session Controller, Locale, Conversation, Renderer, and UI Session, contributing the approval composer entry and pending-request projection. Those capabilities and Cordis are hard peers; no optional dependency is declared. It ships in Web.

Model effect — current agent, none: the package presents approval state and does not register model-facing input; the owning tool records any eventual outcome. Its panel supports transient decisions only, not persistent permission policy. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/client/ui-approval/README.md)

#### `@deepseek-ai/dsh-client-ui-attachment`

Renders pending draft images, the full-page drop invitation, durable Chat and Trajectory images, failure retry controls, and an original-image lightbox for the Web conversation experience.

Composition: Browser Consumer contributing image occupants to slots declared by Conversation, Chat, and Trajectory, with Renderer supplying bindings. Those feature packages and Cordis are hard peers; no optional dependency is declared. It ships in the Web roster.

Model effect — current agent, none: it only renders attachment state supplied by owning packages and adds no request content. Non-image files have no presentation, and the lightbox offers neither zoom nor download. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/client/ui-attachment/README.md)

#### `@deepseek-ai/dsh-client-ui-brand-official`

Fills the sidebar's generic brand mark and name slots with official DeepSeek Harness assets when the browser build selects the official profile, while other builds retain shell fallbacks.

Composition: Browser Consumer contributing two sidebar slot occupants through Renderer; Cordis, UI Renderer, and UI Sidebar are hard peers, with no optional dependency. The Web roster ships it, but registration is conditional on the `official` build profile.

Model effect — current agent, none: branding is browser presentation only. Alternative identities require another package occupying the same slots, and the browser title remains a separate build-time setting. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/client/ui-brand-official/README.md)

#### `@deepseek-ai/dsh-client-ui-chat`

Builds and renders the Chat conversation target, folding transcript nodes and packed Assistant runs, maintaining Chat stores and scroll restoration, and atomically replacing local submission echoes with durable messages.

Composition: Browser Consumer contributing Chat definitions, snapshots, renderers, details, and `useChat` over Conversation, Session, Layout, Workspace, Settings, and Remotes. Those capabilities and Cordis are hard peers; no optional dependency is declared. It ships in Web.

Model effect — current agent, none: Chat renders logged state without assembling or mutating provider requests. The view exposes only the loaded Session window, so older nodes and turn marks require preceding-page loads. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/client/ui-chat/README.md)

#### `@deepseek-ai/dsh-client-ui-commands`

Turns composer slash input into a registered popup, a Host command's required input, or direct execution, while preventing unresolved command lines and image-bearing commands from silently becoming ordinary prompts.

Composition: Browser Service Provider for `ctx.commandUi` and Consumer of Remotes, Locale, Input Trigger, and Conversation. Those capabilities and Cordis are hard peers; no optional dependency is declared. The standard Web roster ships the command surface.

Model effect — current agent, indirect: Host command handlers own any prompt or state change triggered through `command.execute`. Detached results fall back to the console after their originating Session has been torn down. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/client/ui-commands/README.md)

#### `@deepseek-ai/dsh-client-ui-conversation`

Owns target-neutral conversation assembly, the shared shell and composer, queue and view navigation, per-Session bindings, input props, and a durable-image URL cache shared by concrete conversation targets.

Composition: Browser Service Provider for `ctx.uiConversation` and Consumer of Session Controller, Locale, Layout, Renderer, UI Session, Settings, and Workspace. Those capabilities and Cordis are hard peers; no optional dependency is declared. It ships in Web.

Model effect — current agent, none: it sends user-admitted input through Session Controller but does not construct provider requests. Only registered targets render; there is no implicit fallback beyond the registered `chat` preference. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/client/ui-conversation/README.md)

#### `@deepseek-ai/dsh-client-ui-deliverables`

Adds a finished turn's produced-files row and makes matching inline-code file references in the closing response clickable, deriving its vocabulary from successful mutation-tool locations rather than prose guesses.

Composition: Browser Consumer of Remotes, Connection, Locale, Chat, Conversation, and Renderer, plus a static system-prompt contribution. Those capabilities and Cordis are hard peers; no optional dependency is declared. Only the shipped Web patch mounts it.

Model effect — current agent, direct: one static paragraph asks for exact-path or unique-basename inline-code references. Files created only through terminal commands stay outside the clickable vocabulary unless a mutation location records them. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/client/ui-deliverables/README.md)

#### `@deepseek-ai/dsh-client-ui-directory-picker-browse`

Provides an in-browser workspace directory dialog that lists, navigates, filters, and creates folders through the Host, suitable when the browser cannot use an operating-system chooser.

Composition: Browser Consumer filling Workspace's directory-flow slots through Remotes, Locale, and Renderer; it requires the matching Host browse provider and Cordis, with no optional dependency. The Web package set includes it as an opt-in picker alternative.

Model effect — current agent, none: directory selection is browser chrome and never reaches a model request. The dialog supports directory listing and creation, but not search, multi-select, rename, or deletion. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/client/ui-directory-picker-browse/README.md)

#### `@deepseek-ai/dsh-client-ui-directory-picker-native`

Drives the Host machine's operating-system directory chooser from a renderless browser occupant and reports a selected path, cancellation, or failure back to the shared Workspace flow.

Composition: Browser Consumer filling Workspace's directory-flow slots through Renderer; it requires the matching Host native provider and Cordis, with no optional dependency. The Web package set includes it as an opt-in local-browser alternative to browse picking.

Model effect — current agent, none: the chooser is browser chrome and contributes no request data. An open OS dialog cannot be cancelled from the browser, and remote-browser deployments need the browse composition. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/client/ui-directory-picker-native/README.md)

#### `@deepseek-ai/dsh-client-ui-goal`

Shows the current session goal above the composer, offers edit, pause, resume, and clear actions, surfaces mutation failures, and renders durable `/goal` command input as transcript bubbles.

Composition: Browser Consumer contributing Goal controls and command nodes through Remotes, Session Controller, Chat, Conversation, Renderer, and UI Session. Those capabilities and Cordis are hard peers; no optional dependency is declared. It ships in Web.

Model effect — current agent, indirect: GoalService owns the context message queued by each mutation. The durable projection cannot distinguish an active-but-disarmed goal from an armed one because process-local activation is not projected. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/client/ui-goal/README.md)

#### `@deepseek-ai/dsh-client-ui-input-trigger`

Detects `/` and `@` under the composer caret, displays grouped suggestions, supports keyboard and mouse drilling, and routes each pick to the business source registered for that trigger.

Composition: Browser Service Provider for `ctx.inputTriggers` and Consumer of Session Controller, Locale, Conversation, and Renderer. Those capabilities and Cordis are hard peers; no optional dependency is declared. It ships in the standard Web roster.

Model effect — current agent, none: the pipeline only presents and routes picks; consuming command and reference packages own later request effects. Registration is global because per-Session source shadowing is not enabled. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/client/ui-input-trigger/README.md)

#### `@deepseek-ai/dsh-client-ui-jobs`

Adds a session-header popover listing that session's background jobs, ordering live and settled work, showing status and elapsed duration, and deriving all rows from the runtime's mirrored registry state.

Composition: Browser Consumer contributing a read-only header action through Locale, Conversation, and UI Primitives. Those packages and Cordis are hard peers; no optional dependency is declared. It ships in Web beside the Host jobs capability.

Model effect — current agent, none: it renders registry state for a human and issues no RPC. Rows expose neither streamed output nor human cancellation, and process restart clears them while transcript launch cards remain. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/client/ui-jobs/README.md)

#### `@deepseek-ai/dsh-client-ui-layout`

Provides the Web application's resizable three-column frame, responsive panel concession behavior, transient geometry controls, and the document presenter that applies resolved theme tokens and metadata.

Composition: Browser Service Provider for `ctx.layout` and root-slot Consumer of Locale, Renderer, UI Session, and Theme. Those capabilities and Cordis are hard peers; no optional dependency is declared. It ships as the standard Web window chrome.

Model effect — current agent, none: layout manages browser viewing state only. Panel geometry resets on reload and across distinct Session ids, and squeeze reflow offers no scroll anchoring. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/client/ui-layout/README.md)

#### `@deepseek-ai/dsh-client-ui-message-feedback`

Adds Like, Dislike, and optional-note controls to each turn's finalized assistant-message action strip, sharing one Session controller and retaining failed edits locally for later correction.

Composition: Browser Consumer of the message-feedback Remote, Locale, Conversation, and Renderer, contributing the keyed assistant-action entry. Those capabilities and Cordis are hard peers; no optional dependency is declared. It ships in Web with the Host feedback service.

Model effect — current agent, none: ratings and notes stay outside the Session log, model context, and telemetry. The UI has no cross-tab push, and only Chat exposes the controls. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/client/ui-message-feedback/README.md)

#### `@deepseek-ai/dsh-client-ui-model-selection`

Provides the `/model` popup and composer model seat over a provider-grouped per-Session catalog, submitting complete provider, model, and reasoning-effort selections for the next prompt assembly.

Composition: Browser Consumer contributing command and composer controls through Session Controller, Locale, Commands, and Remotes. Those capabilities and Cordis are hard peers; no optional dependency is declared. It ships in the standard Web roster.

Model effect — current agent, indirect: the Host snapshots its selected route at the next prompt-assembly boundary. It cannot choose a model before Session creation or independently address a subagent continuation. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/client/ui-model-selection/README.md)

#### `@deepseek-ai/dsh-client-ui-permission-presets`

Provides a General-settings default for later sessions and a `/permission` picker for the current session, sharing Host-projected presets, localized built-in labels, and an explicit acknowledgement before full access.

Composition: Browser Consumer contributing Settings and Commands controls through Session Controller, Locale, Remotes, and their slot owners. Those capabilities and Cordis are hard peers; no optional dependency is declared. It ships in Web when the permission projection exists.

Model effect — current or later current agent, indirect: written permission facts select sandbox and approval policy for later tool calls. The Settings row is Web-only, and Host-provided preset descriptions may not match the active language. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/client/ui-permission-presets/README.md)

#### `@deepseek-ai/dsh-client-ui-plan`

Shows a warn-colored Plan status chip while the Host projection says plan mode is active, lets the user dispatch `/plan off`, and supplies the plan-specific composer placeholder.

Composition: Browser Consumer contributing the plan seat through Remotes, Locale, and Conversation; Cordis and those client capabilities are hard peers, with no optional dependency. The Web roster ships it alongside the separately owned Plan Mode service.

Model effect — current agent, indirect: `dsh-plan-mode` owns the policy section, exit schema, and logged state changed by its command. The chip disappears during whole-composer interactions and offers no inactive-mode control. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/client/ui-plan/README.md)

#### `@deepseek-ai/dsh-client-ui-reference`

Combines Web `@file`, `@folder`, and `@session` suggestions into one localized list, supports directory drilling, and inserts canonical atomic references while allowing each discovery domain to fail independently.

Composition: Browser Consumer registering the `reference` source through Remotes, Session Controller, Connection, Locale, and Input Trigger. Those capabilities and Cordis are hard peers; no optional dependency is declared. It ships in Web with Host reference providers.

Model effect — current agent, indirect: Host providers own file guidance and session-context preparation after a selected mention. Candidate failures are intentionally quiet, and file completion has no browser-side filesystem fallback. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/client/ui-reference/README.md)

#### `@deepseek-ai/dsh-client-ui-renderer`

Hydrates the boot page into the assembled React application and binds runtime observable sources to typed slot hooks, keeping business components free of subscription and Cordis-context machinery.

Composition: Browser Service Provider for `ctx.uiRenderer` and sole root-slot renderer. Cordis is the hard peer and no optional dependency is declared. The Web shell ships it as immediate infrastructure and mounts only after the complete client roster settles.

Model effect — current agent, none: rendering contributes no request content. The first application frame waits for every client entry, and slot rendering has no Suspense integration or per-entry lazy mount. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/client/ui-renderer/README.md)

#### `@deepseek-ai/dsh-client-ui-schedule`

Adds a read-only Session-header catalog of active reminders, deriving status, browser-local time, relative time, and ordering for users from the complete Schedule projection without issuing mutations.

Composition: Browser Consumer contributing a header action through Locale, Conversation, and UI Primitives. Those packages and Cordis are hard peers; no optional dependency is declared. The Web graph ships its row disabled until the explicit Schedule overlay enables it.

Model effect — current agent, none: it displays a completed projection and never changes prompts or tool results. The surface shows active records only, uses the viewing browser's clock, and cannot create or delete reminders. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/client/ui-schedule/README.md)

#### `@deepseek-ai/dsh-client-ui-session`

Adapts Session Controller state into standard root and per-Session React hooks, props, pending-interaction projections, and `SessionProvider` behavior without taking ownership of transport or lifecycle state.

Composition: Browser Provider and Consumer connecting Session Controller to UI Renderer and session-scoped slots. Cordis and those two capabilities are hard peers; no optional dependency is declared. It ships as standard Web rendering infrastructure.

Model effect — current agent, none: Session selectors and slot scopes do not assemble model requests. Pending interactions are process-local projections, so their owning Remote waterfall must replay an outstanding request after reconnect. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/client/ui-session/README.md)

#### `@deepseek-ai/dsh-client-ui-settings`

Gives preference features revision-fenced, namespace-scoped access to the Host settings document, rehydrates schemas, performs immutable edits, and declares the shared slots that settings pages and onboarding flows fill.

Composition: Browser Service Provider for `ctx.settingsScope` and `ctx.settingsSchema`, consuming the Settings Remote but no presentation package. Remotes and Cordis are hard peers; no optional dependency is declared. It ships as the Web settings foundation.

Model effect — current agent, none: settings transport registers nothing model-facing. Non-loopback pages receive no durable settings scope, leaving backed rows unavailable even though Connection still authenticates other API calls. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/client/ui-settings/README.md)

#### `@deepseek-ai/dsh-client-ui-settings-general`

Provides the Settings shell, sidebar trigger, navigation, connection-recovery indicator, General section, configuration-file action, shared dictionaries, and ordered first-run onboarding host while feature packages own their rows.

Composition: Browser Consumer contributing Settings chrome and General slots through Settings, Locale, Connection, Remotes, and Sidebar. Those capabilities and Cordis are hard peers; no optional dependency is declared. It ships in the standard Web roster.

Model effect — current agent, none: the shell registers no model-facing content. Its General section contains no built-in rows, so every visible preference depends on the corresponding feature plugin being mounted. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/client/ui-settings-general/README.md)

#### `@deepseek-ai/dsh-client-ui-settings-models`

Lets Web users configure provider API-key references, curated model lists, and custom pi-ai routes, and coordinates first-run notices and official DeepSeek credential onboarding over one joined snapshot.

Composition: Browser Consumer contributing the Models settings section and onboarding entries through Settings, Locale, and Remotes. Those capabilities and Cordis are hard peers; no optional dependency is declared. It ships in Web with model and credential services.

Model effect — current agent, none: the page edits Host configuration but registers no request content itself. Its hand-written cards expose only curated fields, and only pi-ai routes can be declared through the custom-provider flow. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/client/ui-settings-models/README.md)

#### `@deepseek-ai/dsh-client-ui-settings-plugin-inventory`

Adds a lazily loaded, read-only Plugin list tab that groups global and preset Loader entries, shows enablement and failure details, searches both planes, and supports explicit retry.

Composition: Browser Consumer contributing a Plugins-settings tab through Remotes, Settings, Locale, and Agent Preset dictionaries. Those capabilities and Cordis are hard peers; no optional dependency is declared. It ships in the standard Web roster.

Model effect — current agent, none: inventory projection adds no model-visible information. The tab takes one snapshot per Settings mount or retry, subscribes to no Loader changes, and cannot alter enablement. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/client/ui-settings-plugin-inventory/README.md)

#### `@deepseek-ai/dsh-client-ui-settings-plugins`

Provides the Web Plugins settings section, extensible feature tabs, and revision-fenced cards for editing user-owned Host plugin configuration while preserving composed defaults and secret-role handling.

Composition: Browser Consumer and slot owner over Settings, Locale, and Remotes, dispatching cards only where a live Host namespace and registered browser card intersect. Those capabilities and Cordis are hard peers; no optional dependency is declared. It ships in Web.

Model effect — current agent, none: the settings surface contributes no prompt or tool schema. Only Host-plane plugins appear; agent-preset plugin configuration remains in each preset's composition files. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/client/ui-settings-plugins/README.md)

#### `@deepseek-ai/dsh-client-ui-sidebar`

Provides the Web sidebar shell for users with brand seats, new-session entry, collapsible control rail, Settings seat, and a scroll-aware region for the Workspace-owned session browser.

Composition: Browser Consumer contributing sidebar chrome through Workspace Controller, Renderer, Layout, UI Session, Workspace, and Locale. Those capabilities and Cordis are hard peers; no optional dependency is declared. It ships in the standard Web roster.

Model effect — current agent, none: sidebar navigation is browser viewing state. Workspace grouping, ordering, search, state dots, and unread semantics belong to occupants rather than this shell. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/client/ui-sidebar/README.md)

#### `@deepseek-ai/dsh-client-ui-skill`

Offers user-invocable skills in slash suggestions, inserts literal `/name` references that the Host loads deterministically, and renders settled skill calls as expandable instruction cards from durable tool history.

Composition: Browser Consumer registering an Input Trigger source and keyed Tool view through Session Controller, Locale, Renderer, Remotes, and UI Tool. Those capabilities and Cordis are hard peers; no optional dependency is declared. It ships in Web.

Model effect — current agent, direct: the sent `/name` remains in the user message and the Host appends canonical skill instructions for that step. References are plain text with no occurrence identity or structured wire payload. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/client/ui-skill/README.md)

#### `@deepseek-ai/dsh-client-ui-subagent`

Lets Web users browse a parent session's complete subagent descendant catalog, open exact child conversations, continue eligible children, interrupt current child work, and insert running-child labels through `@` suggestions.

Composition: Browser Consumer contributing header navigation, composer states, and an Input Trigger source through Session Controller, Locale, Conversation, UI Primitives, and Input Trigger. Those capabilities and Cordis are hard peers; no optional dependency is declared. It ships in Web.

Model effect — current or child agent, direct: selected labels and accepted continuations become ordinary user-message text. The catalog records no durable outcome, and duplicate or renamed `@` labels remain ambiguous display text. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/client/ui-subagent/README.md)

#### `@deepseek-ai/dsh-client-ui-theme`

Lets Web users choose light, dark, or system appearance and conversation font size, publishes immutable theme snapshots, ships design tokens, and applies persisted palette values before the plugin shell paints.

Composition: Browser Service Provider for `ctx.theme` and Consumer of Connection, Locale, Renderer, Settings, and Remotes. Those capabilities and Cordis are hard peers; no optional dependency is declared. It ships immediately in the Web roster.

Model effect — current agent, none: theme state changes browser presentation only. Third-party themes merely override named alias variables, and the registry does not validate that an override set is complete. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/client/ui-theme/README.md)

#### `@deepseek-ai/dsh-client-ui-tool`

Renders every conversation tool call as a root and subcall tree, dispatches atomic calls to keyed business views, and falls back to a generic card for unknown or malformed data.

Composition: Browser Consumer and keyed-slot owner over Workspace Controller, Connection, Locale, and Conversation, contributing built-in first-party Tool views. Those capabilities and Cordis are hard peers; no optional dependency is declared. It ships in Web.

Model effect — current agent, none: it presents logged calls without changing model context. First-party views remain colocated here, although owners can move them independently through the keyed registration slot. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/client/ui-tool/README.md)

#### `@deepseek-ai/dsh-client-ui-trajectory`

Provides a virtualized, turn-aware event ledger and timing overview with record selection, loaded-window search, timeline zoom, and inspectors for token usage, duration, content, and durable images.

Composition: Browser Consumer contributing Trajectory definitions and a Conversation view through Session Controller, Locale, Conversation, Renderer, and UI Session. Those capabilities and Cordis are hard peers; no optional dependency is declared. It ships in Web.

Model effect — current agent, none: the view consumes browser-side event state only. In-flight rows deliberately leave duration blank, and timeline or record selections have no durable deep-link anchor. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/client/ui-trajectory/README.md)

#### `@deepseek-ai/dsh-client-ui-user-questions`

Takes over the Web composer for agent questions, supports structured multi-question answers and drafts, and presents plan review as a specialized approve, refuse, or chat-about-it card.

Composition: Browser Consumer contributing the `question` composer entry through Remotes, Session Controller, Locale, Conversation, Renderer, and UI Session. Those capabilities and Cordis are hard peers; no optional dependency is declared. It ships in Web.

Model effect — current agent, indirect: `dsh-tool-ask-user` owns the visible schema and returned answer that this UI collects. Drafts survive page-local Session navigation only, and one pending request owns the composer at a time. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/client/ui-user-questions/README.md)

#### `@deepseek-ai/dsh-client-ui-workflow-run`

Reconstructs top-level workflow runs from durable events as independent Chat nodes with nested phase and member disclosures, aggregate status, interruption inference, and strictly live child navigation.

Composition: Browser Consumer contributing a Workflow Conversation Node through Session Controller, Locale, Chat, Conversation, Renderer, and UI Session. Those capabilities and Cordis are hard peers; no optional dependency is declared. It ships in Web.

Model effect — current agent, none: it renders durable workflow records without changing context. Only top-level `dsh-tool-workflow` calls produce nodes, and terminal members cannot be opened from this surface. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/client/ui-workflow-run/README.md)

#### `@deepseek-ai/dsh-client-ui-workspace`

Provides the shared Workspace browser and picker, grouped or flat Session navigation, search, ordering, add and rename flows, fork and archive actions, and pending-interaction or Schedule markers.

Composition: Browser Consumer and slot contributor over Remotes, both controllers, Connection, Locale, Conversation, Renderer, UI Session, and Sidebar. Those capabilities and Cordis are hard peers; no optional dependency is declared. It ships in Web.

Model effect — current agent, none: Workspace presentation registers no model-facing input. Content search is literal rather than fuzzy, archived Sessions have no unarchive surface, and native picking requires a local Host carrier. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/client/ui-workspace/README.md)

### examples

The [examples package group](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/examples/README.md) contains reusable composition plugins; its package-reference entry assembles the common agent runtime without choosing a UI, filesystem provider, or final shell executor.

#### `@deepseek-ai/dsh-agent-spine-demo`

Builds a usable executor-less and UI-less agent from sessions, prompts, tools, titles, skills, retry, and optional goals, leaving the deployment to supply an LLM and executor.

Composition: Reusable orchestrator requiring the core agent stack and mounting many consumer plugins; SDK-minimal ships it nested, while other applications use the broader base composition instead.

Model effect on current agent: indirect through its mounted prompt, skill, shell, job, retry, and optional goal plugins; most spine membership is fixed in code rather than configurable. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/examples/agent-spine-demo/README.md)

### test-support

The [test-support package group](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/test-support/README.md) contains runnable infrastructure for deterministic product tests; its package-reference plugin replays recorded model streams through the real LLM registry and agent loop.

#### `@deepseek-ai/dsh-llm-replay`

Serves provider streams reconstructed from recorded session JSONL fixtures so snapshot scenarios run the real agent loop deterministically without any network request or API key.

Composition: Test LLM adapter requiring the LLM and session services, with compaction and DeepSeek extension facts supported; shipped production profiles omit it and snapshot harnesses mount it explicitly.

Model effect on current agent: none because no provider model receives a request; first-call-order script binding assumes sequential delegation and cannot reliably assign concurrently started sibling traces. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/test-support/llm-replay/README.md)

### runtime-diagnostics

The [runtime-diagnostics package group](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/runtime-diagnostics/README.md) runs package-owned live checks against durable events and mutable state, attributing violations to their owning package while selection filters control which companions execute.

#### `@deepseek-ai/dsh-invariants`

This diagnostic registry installs package-owned invariant companions, runs their live relationship checks, and raises an owner-attributed `InvariantError` when authoritative events and mutable state disagree during execution.

Composition: Service Definition and provider at `ctx.invariants`, with Cordis as its only hard peer; package companions contribute checks. Standard agent composition ships core companions, while the service alone installs none.

Model effect — current agent, none: checks observe assembled requests and durable state without rewriting them; enablement and package allowlists or blocklists remain fixed for the service lifetime. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/runtime-diagnostics/invariants/README.md)

### karaka

The [Karaka package group](https://github.com/karaka-ai/karaka/blob/main/packages/karaka/README.md) connects application backends to a persistent multi-agent Harness process through authenticated server ingress; its SDK, CLI, and installable harness bundle are non-plugin companions outside this landscape.

#### `@karaka/server-auth`

Defines replaceable server-to-server authentication and supplies the shared-bearer provider that verifies inbound application identity and resolves independently rotatable credentials for outbound application MCP tools.

Composition: Service Definition and default Provider at `ctx.serverAuth`, requiring the credentials service. The Karaka harness bundle ships it for application ingress and authenticated outbound tool calls.

Model effect on current agent: none because authentication metadata never enters prompts, messages, or schemas; shared bearer is the only bundled provider and production TLS remains deployment-owned. [Package contract](https://github.com/karaka-ai/karaka/blob/main/packages/karaka/server-auth/README.md)

#### `@karaka/transport-http`

Mounts authenticated JSON and SSE chat routes that admit application commands, read history, stream stable Session events, and carry structured user-question responses for application-owned chats.

Composition: Transport Consumer requiring `serverAuth`, `sessionController`, and `webServer`, with lifecycle-owned routes, interactions, and streams. The Karaka harness bundle ships it on the persistent Host process.

Model effect on current agent: none because the transport does not assemble model requests; pending interactions are process-local and multi-replica deployments need external routing or coordination. [Package contract](https://github.com/karaka-ai/karaka/blob/main/packages/karaka/transport-http/README.md)

### mcp

The [MCP package group](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/mcp/README.md) bridges external Model Context Protocol servers into the native Harness tool registry while leaving each server's transport, lifecycle, schemas, and results explicit.

#### `@deepseek-ai/dsh-mcp-client`

Connects one external MCP server per plugin instance, discovers its tools, assigns stable server-qualified names, refreshes registrations after changes, and supports stdio or Streamable HTTP transport.

Composition: Dynamic tool adapter requiring tools, with subprocess needed for stdio, image integrations optional, and `serverAuth` conditional when `applicationId` is set. Built-in bundles activate no server; Karaka's CLI scaffold enables its application tools instance.

Model effect on current agent: direct through discovered schemas, calls, and retained results; the bridge supports MCP tools only, excluding MCP resources and prompts. [Package contract](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/mcp/mcp-client/README.md)
-----

<a id="further-exploration"></a>
## Further Exploration

- [Architecture](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/architecture.md) — profiles, the runtime spine, turn flow, event domains, and extension choices.
- [Package map](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/README.md) — every package group, including libraries and bundles outside this plugin-only reference.
- [Subsystem index](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/subsystems/README.md) — shared types, semantics, and generated Cordis API regions.
- [Capability map](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/capability-seams.md) — complete Service Definition, Service Provider, and Consumer relationships.
- [Configuration catalog](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/config-catalog.md) — exhaustive configuration declarations for loadable plugins.
- [Tool catalog](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/tool-catalog.md) — exhaustive model-facing tool schemas and effects.

-----

<a id="dev-note"></a>
## Dev Note

<details>
<summary>Working context for maintainers — click to expand</summary>

None.

</details>
