## Potential Micro Services

project dependencies
```bash
npm i express cors dotenv morgan zod 

```
project dev dependencies
```bash
npm i -D prisma @prisma/client

```
install typescript
```bash
npm i -D typescript tsc ts-node-dev tsc-alias tsconfig-paths

```

install types
```bash
npm i -D @types/express @types/node @types/cors

```
set up tsconfig
```json
{
    "compilerOptions": {
        "target": "ESNext",
        "lib": ["ES6"],
        "allowJs": true,
        "module": "commonjs",
        "strict": true,
        "rootDir": ".",
        "outDir": "./dist",
        "esModuleInterop": true,
        "moduleResolution": "node",
        "resolveJsonModule": true,
        "allowSyntheticDefaultImports": true,
        "baseUrl": "./src",
        "paths": {
            "@/*": ["*"]
        },
        "noImplicitAny": false,
        "types": ["node","express"],
        "typeRoots": ["node_modules/@types","./src/types"],
    },
    "include": [
        "src/**/*"
    ],
    "exclude": [
        "node_modules",
        "dist"
    ]
}

```

set up package.json
```json
{
  "name": "inventory",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "build": "tsc && tsc-alias",
    "dev": "ts-node-dev -r tsconfig-paths/register src/index.ts",
    "migrate:dev": "prisma migrate dev",
    "migrate:deploy": "prisma migrate deploy"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "@prisma/client": "^5.20.0",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.21.1",
    "morgan": "^1.10.0",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/cors": "^2.8.17",
    "@types/express": "^5.0.0",
    "@types/node": "^22.7.5",
    "prisma": "^5.20.0",
    "ts-node-dev": "^2.0.0",
    "tsc": "^2.0.4",
    "tsc-alias": "^1.8.10",
    "tsconfig-paths": "^4.2.0",
    "typescript": "^5.6.3"
  }
}
```

set up docker-compose.yaml
```yaml
#postgres
#pgadmin

version: "3.8"

services:
  postgres:
    image: postgres:13
    container_name: postgres
    restart: on-failure

    ports:
      - 5432:5432
    environment:
       POSTGRES_USER: postgres
       POSTGRES_PASSWORD: postgres
       POSTGRES_DB: postgres
    volumes:
      - postgres:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD", "pg_isready" ,"-U", "auth"]
      interval: 30s
      timeout: 30s
      retries: 3

  pgadmin:
    image: dpage/pgadmin4
    container_name: pgadmin
    restart: on-failure
    ports:
      - '5050:80'
      - '5051:443'
    environment:
       PGADMIN_DEFAULT_EMAIL: admin@example.com
       PGADMIN_DEFAULT_PASSWORD: admin

volumes:
  postgres:
```

open terminal and run
```bash
docker-compose up
```
or another one
```bash
docker-compose up --build
```

run server
```bash
npm run dev
```
migrate database
```bash
npm run migrate:dev
```

<!-- --api-getway
  --src
    --controllers
    --index.ts
  package.json
  package-lock.json
  tsconfig.json
--services
  --auth
    --src
      --controllers
      --index.ts
    package.json
    package-lock.json
    tsconfig.json
  --user
  --email
  --product
  --inventory -->