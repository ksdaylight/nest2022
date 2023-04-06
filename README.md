<p align="center">
  <img alt="" src="https://img.densewillow.com/blog/anest202304020941528.png">
</p>
<h1 align="center">Nest-Pegasus</h1>
<p align="center">
<a href=""><img alt="NestJs" src="https://img.shields.io/badge/-NestJs-333333?style=flat&logo=nestjs&logoColor=ea2845" /></a>
<a href=""><img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white" /></a>
<a href=""><img alt="TypeORM" src="https://img.shields.io/badge/-TypeORM-orange" /></a>
<a href=""><img alt="Elasticsearch" src="https://img.shields.io/static/v1?style=flat&message=Elasticsearch&color=005571&logo=Elasticsearch&logoColor=FFFFFF&label=" /></a>
<a href=""><img alt="Fastify" src="https://img.shields.io/static/v1?style=flat&message=Fastify&color=000000&logo=Fastify&logoColor=FFFFFF&label=" /></a>
<a href=""><img alt="BullMQ" src="https://img.shields.io/badge/-BullMQ-yellow" /></a>
<a href=""><img alt="Redis" src="https://img.shields.io/static/v1?style=flat&message=Redis&color=DC382D&logo=Redis&logoColor=FFFFFF&label=" /></a>
<a href=""><img alt="MySQL" src="https://img.shields.io/static/v1?style=flat&message=MySQL&color=4479A1&logo=MySQL&logoColor=FFFFFF&label=" /></a>
<a href="https://nestjs.com/"><img alt="License" src="https://img.shields.io/github/license/kuizuo/kz-admin?style=flat&colorA=002438&colorB=28CF8D"/></a>
</p>

<p align="center">Nest-Pegasus is an all-in-one full-stack backend framework that incorporates content management, user authentication, role-based access control, search, and file handling capabilities.</p>

## 📚 Directory Structure
 Here's an overview of the project's directory structure:
```
    .
    ├── assets # Static files for populating data
    │   ├── ...
    ├── cli.js # Command line tool entry
    ├── config # Configuration files for each module
    │   ├── ...
    ├── creator.ts 
    ├── database # Database migration, seeding, etc.
    │   ├── ...
    ├── main.ts
    ├── modules 
    │   ├── content # Content module
    │   │   ├── ...
    │   ├── core # Dynamic configuration system, global validation pipes, interceptors, and filters
    │   │   ├── ...
    │   ├── database # Database module
    │   │   ├── ...
    │   ├── elastic # ElasticSearch full-text search
    │   │   ├── ...
    │   ├── media # File upload/download and cloud storage
    │   │   ├── ...
    │   ├── queue # BullMQ asynchronous message queue
    │   │   ├── ...
    │   ├── rbac # Dynamic permission module based on CASL
    │   │   ├── ...
    │   ├── redis
    │   │   ├── ...
    │   ├── restful # Configurable RESTful routing
    │   │   ├── ...
    │   ├── sender # WebSocket message broadcasting
    │   │   ├── ...
    │   └── user # User module
    │       ├── ...
    └── routes # Open API document version configuration
        ├── index.ts
        └── v1.ts
```

##  📕Main Features and Functionality

Nest-Pegasus provides a comprehensive backend solution that covers content management, user authentication, role-based access control, search, and file handling capabilities. Here are the key features and functionality of the project:

1.  Powerful content management system, supporting creation, update, and deletion of various content types, including articles, media files, and more.
2.  Comprehensive user authentication and authorization, using JWT tokens and role-based access control (RBAC) to manage user access to resources.
3.  Elasticsearch integration for fast and efficient full-text search capabilities.
4.  File handling and storage, supporting both local and cloud-based storage solutions.
5.  Asynchronous message queue processing with BullMQ for handling background tasks and improving application performance.
6.  Redis integration for caching and session management.
7.  Extensive API support with OpenAPI documentation and versioning  
####  ☑️Planned Features (Todo List)
 - [ ] Multilingual support.
 - [ ] API rate limiting and security measures.
 - [ ] Containerization and deployment.
 - [ ] GraphQL integration.
 - [ ]  ...

## 🛠Technology Stack and Dependencies

Nest-Pegasus is built on top of a robust technology stack and relies on various libraries and tools to deliver its features. Here is a list of the main technologies and dependencies used in the project:

1.  **[Nest.js](https://nestjs.com/)**: A progressive Node.js framework for building efficient, reliable, and scalable server-side applications.
2.  **[TypeScript](https://www.typescriptlang.org/)**: A strongly-typed superset of JavaScript that enables better developer experience and improved code maintainability.
3.  **[TypeORM](https://typeorm.io/)**: A powerful Object Relational Mapping (ORM) library for TypeScript and JavaScript that supports multiple databases and advanced querying capabilities.
4.  **[MySQL](https://www.mysql.com/)**: A popular open-source relational database management system used for storing and managing application data.
5.  **[Elasticsearch](https://www.elastic.co/)**: A distributed, RESTful search and analytics engine for all types of data, including textual, numerical, geospatial, structured, and unstructured.
6.  **[Fastify](https://www.fastify.io/)**: A high-performance web framework for Node.js that provides faster HTTP responses and lower overhead compared to other frameworks.
7.  **[BullMQ](https://github.com/taskforcesh/bullmq)**: A powerful and easy-to-use message queue library for Node.js built on top of Redis.
8.  **[Redis](https://redis.io/)**: An in-memory data structure store, used as a database, cache, and message broker.

In addition to these core technologies, Nest-Pegasus also utilizes various other libraries and tools to support its functionality. The full list of dependencies can be found in the `package.json` file of the project.


## ⚓Installation and Configuration
To get started with Nest-Pegasus, follow these steps:
1. **Clone and Install dependencies**

```
git clone https://github.com/ksdaylight/Nest-Pegasus.git
cd nest-pegasus 
pnpm install
```

2. **Configure environment variables**: Create a `.env` file in the root directory of the project and configure the necessary environment variables. You can use the provided `.env.example` file as a reference. 
3. **Run database migrations**: Run the following command to perform the database migrations and seed data::
```
pnpm dbmr -s
```
You can use `pnpm cli -h` to see the help for available commands. This command will perform the migrations and then seed the database with initial data.
## 🚀Running and Deployment

After completing the installation and configuration steps, you can now run and deploy Nest-Pegasus
```
pnpm start
```
## 📈Visual Illustrations and Result Demonstrations

To help you better understand the various processes and functionalities within Nest-Pegasus, we've provided a series of flowcharts and result demonstrations. These visual aids will help you comprehend the inner workings of the framework.

### 1. Basic Request Handling Process

![Basic Request Handling Process](https://img.densewillow.com/blog/baseFlow.png)

### 2. OpenAPI Swagger Documentation Integration

![OpenAPI Swagger Documentation Integration0](https://img.densewillow.com/blog/openapi1.bmp)
![OpenAPI Swagger Documentation Integration1](https://img.densewillow.com/blog/screencapture1.png)
![OpenAPI Swagger Documentation Integration2](https://img.densewillow.com/blog/screencapture2.png)


### 3. JWT Guard Authentication Flowchart

![JWT Guard Authentication Flowchart](https://img.densewillow.com/blog/jwt.svg)

### 4. Dynamic Permissions Flowchart

![Dynamic Permissions Flowchart](https://img.densewillow.com/blog/DynamicPermissions.drawio.svg)

### 5. Websocket Message Broadcasting Flowchart

![Websocket Message Broadcasting Flowchart](https://img.densewillow.com/blog/Websocket.drawio.svg)

### 6. SMS and Email Queue Flowchart

![SMS and Email Queue Flowchart](https://img.densewillow.com/blog/SMS.drawio.svg)

