# websocket-clients

TypeScript WebSocket collectors: Binance ticker stream and EVM new-block stream, plus CDK pipelines that build/push images to ECR. Archived snapshot, as-is.

This tree is a **new public commit** with no git history. The original private archive is `eulertools/websocket-clients-archive`.

## What was built (EN)

- `services/binance-client` — `node-binance-api` websocket → Kinesis. API key/secret from `process.env`.
- `services/evm-socket-client` — Web3 websocket new-heads → Kinesis/SQS. Node URL and Sentry DSN from env.
- `pipelines/` — CDK CodePipeline + GitHub → ECR (`oauthToken` from Secrets Manager name `githubToken`, not a committed secret).

No recorded contract deployments.

## Qué se construyó (ES)

Clientes WebSocket para Binance y redes EVM, con pipelines CDK hacia ECR. Sin deployments de contratos.

---

## Notice / Aviso

**Euler Tools ha cerrado. Euler Tools is closed.**

La empresa quebró. Este repositorio está archivado y no se mantiene. El software se ofrece tal cual (as is), sin garantía ni soporte. Parte del material puede ser reclamado por acreedores.

The company went bankrupt. This repository is archived and unmaintained. Software is provided as is, with no warranty and no support. Some material may be claimed by creditors.

Site: https://euler.tools  
Org: https://github.com/eulertools  
Enquiries: https://sinequix.com · https://github.com/tebayoso
