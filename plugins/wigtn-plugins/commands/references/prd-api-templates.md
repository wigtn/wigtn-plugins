# PRD API Specification Templates

`/prd` Phase 3에서 선택한 API 유형의 상세 템플릿. REST / GraphQL / gRPC / WebSocket / OpenAPI 템플릿과 로그인 API 예시를 담고 있다. 필요한 유형 섹션만 참고하여 PRD §5.1 API Specification을 작성한다.

---

#### 3.1 REST API 명세 템플릿

```markdown
### API: [Endpoint Name]

#### `[METHOD] /api/v1/[resource]`

**Description**: [엔드포인트 설명]

**Authentication**: Required / Optional / None

**Headers**:
| Header | Required | Description |
|--------|----------|-------------|
| Authorization | Yes | Bearer {accessToken} |
| Content-Type | Yes | application/json |

**Request Body**:
```json
{
  "field1": "string (required) - 필드 설명",
  "field2": "number (optional) - 필드 설명",
  "field3": {
    "nested": "string (required) - 중첩 필드 설명"
  }
}
```

**Request Example**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "rememberMe": true
}
```

**Response 200 OK**:
```json
{
  "success": true,
  "data": {
    "id": "string - 리소스 ID",
    "createdAt": "string (ISO 8601) - 생성 시간"
  },
  "meta": {
    "timestamp": "string (ISO 8601)"
  }
}
```

**Response Example**:
```json
{
  "success": true,
  "data": {
    "id": "usr_123456",
    "email": "user@example.com",
    "createdAt": "2024-01-15T09:30:00Z"
  },
  "meta": {
    "timestamp": "2024-01-15T09:30:00Z"
  }
}
```

**Error Responses**:
| Status | Code | Message | Description |
|--------|------|---------|-------------|
| 400 | INVALID_INPUT | Invalid request body | 요청 본문 유효성 검사 실패 |
| 401 | UNAUTHORIZED | Authentication required | 인증 토큰 누락 또는 만료 |
| 403 | FORBIDDEN | Access denied | 권한 없음 |
| 404 | NOT_FOUND | Resource not found | 리소스 없음 |
| 409 | CONFLICT | Resource already exists | 중복 리소스 |
| 422 | VALIDATION_ERROR | Validation failed | 비즈니스 규칙 위반 |
| 500 | INTERNAL_ERROR | Internal server error | 서버 오류 |

**Error Response Format**:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "Invalid request body",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  },
  "meta": {
    "timestamp": "2024-01-15T09:30:00Z"
  }
}
```

**Rate Limiting**:
- Limit: 100 requests per minute
- Headers: X-RateLimit-Limit, X-RateLimit-Remaining
```

---

#### 3.2 GraphQL Schema 템플릿

```graphql
# Schema Definition
type Query {
  """사용자 정보 조회"""
  user(id: ID!): User

  """사용자 목록 조회 (페이지네이션)"""
  users(
    first: Int = 20
    after: String
    filter: UserFilter
  ): UserConnection!
}

type Mutation {
  """회원가입"""
  signUp(input: SignUpInput!): AuthPayload!

  """로그인"""
  signIn(input: SignInInput!): AuthPayload!

  """로그아웃"""
  signOut: Boolean!
}

type Subscription {
  """실시간 알림 구독"""
  onNotification(userId: ID!): Notification!
}

# Types
type User {
  id: ID!
  email: String!
  name: String!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type AuthPayload {
  accessToken: String!
  refreshToken: String!
  user: User!
}

# Inputs
input SignUpInput {
  email: String!
  password: String!
  name: String!
}

input SignInInput {
  email: String!
  password: String!
  rememberMe: Boolean = false
}

# Pagination (Relay Cursor Connection)
type UserConnection {
  edges: [UserEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type UserEdge {
  cursor: String!
  node: User!
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}

# Error Handling
type UserError {
  field: String
  message: String!
  code: ErrorCode!
}

enum ErrorCode {
  INVALID_INPUT
  UNAUTHORIZED
  NOT_FOUND
  CONFLICT
  RATE_LIMITED
}
```

---

#### 3.3 gRPC Proto 정의 템플릿

```protobuf
syntax = "proto3";

package auth.v1;

option go_package = "github.com/example/auth/v1;authv1";

// AuthService 정의
service AuthService {
  // 회원가입
  rpc SignUp(SignUpRequest) returns (SignUpResponse);

  // 로그인
  rpc SignIn(SignInRequest) returns (SignInResponse);

  // 토큰 갱신
  rpc RefreshToken(RefreshTokenRequest) returns (RefreshTokenResponse);

  // 사용자 정보 스트리밍 (서버 스트리밍)
  rpc WatchUser(WatchUserRequest) returns (stream UserEvent);
}

// Request/Response Messages
message SignUpRequest {
  string email = 1;
  string password = 2;
  string name = 3;
}

message SignUpResponse {
  User user = 1;
  AuthTokens tokens = 2;
}

message SignInRequest {
  string email = 1;
  string password = 2;
  bool remember_me = 3;
}

message SignInResponse {
  User user = 1;
  AuthTokens tokens = 2;
}

message RefreshTokenRequest {
  string refresh_token = 1;
}

message RefreshTokenResponse {
  AuthTokens tokens = 1;
}

message WatchUserRequest {
  string user_id = 1;
}

message UserEvent {
  EventType type = 1;
  User user = 2;
  google.protobuf.Timestamp timestamp = 3;

  enum EventType {
    EVENT_TYPE_UNSPECIFIED = 0;
    EVENT_TYPE_UPDATED = 1;
    EVENT_TYPE_DELETED = 2;
  }
}

// Common Types
message User {
  string id = 1;
  string email = 2;
  string name = 3;
  google.protobuf.Timestamp created_at = 4;
  google.protobuf.Timestamp updated_at = 5;
}

message AuthTokens {
  string access_token = 1;
  string refresh_token = 2;
  int64 expires_in = 3;  // seconds
}

// Error Details (Google API Error Model)
import "google/rpc/status.proto";
import "google/rpc/error_details.proto";

// 에러 코드: google.rpc.Code 사용
// INVALID_ARGUMENT (3), UNAUTHENTICATED (16),
// NOT_FOUND (5), ALREADY_EXISTS (6),
// RESOURCE_EXHAUSTED (8) for rate limiting
```

---

#### 3.4 WebSocket 이벤트 스펙 템플릿

```markdown
### WebSocket: [Namespace/Feature]

**Endpoint**: `wss://api.example.com/ws/v1/[namespace]`

**Connection Flow**:
```
Client                           Server
  |                                 |
  |--- WS Upgrade Request --------->|
  |<-- 101 Switching Protocols -----|
  |                                 |
  |--- auth:connect (token) ------->|
  |<-- auth:connected (session) ----|
  |                                 |
  |<-- event:notification ----------|
  |--- event:ack (eventId) -------->|
  |                                 |
  |--- ping ----------------------->|
  |<-- pong ------------------------|
```

**Authentication**:
```json
// Client → Server
{
  "type": "auth:connect",
  "payload": {
    "token": "Bearer eyJhbGciOi..."
  }
}

// Server → Client (Success)
{
  "type": "auth:connected",
  "payload": {
    "sessionId": "sess_abc123",
    "userId": "usr_123",
    "expiresAt": "2024-01-15T10:30:00Z"
  }
}

// Server → Client (Error)
{
  "type": "auth:error",
  "payload": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token"
  }
}
```

**Event Types**:
| Event | Direction | Description |
|-------|-----------|-------------|
| `auth:connect` | C → S | 연결 인증 요청 |
| `auth:connected` | S → C | 인증 성공 |
| `auth:error` | S → C | 인증 실패 |
| `subscribe` | C → S | 채널 구독 |
| `unsubscribe` | C → S | 구독 해제 |
| `notification` | S → C | 알림 푸시 |
| `presence:update` | S → C | 사용자 상태 변경 |
| `ping` | C → S | 연결 유지 |
| `pong` | S → C | 핑 응답 |

**Message Format**:
```typescript
interface WebSocketMessage {
  type: string;           // 이벤트 타입
  payload: object;        // 데이터
  id?: string;            // 메시지 ID (ACK용)
  timestamp?: string;     // ISO 8601
}
```

**Subscription Example**:
```json
// Subscribe to channel
{
  "type": "subscribe",
  "payload": {
    "channel": "notifications",
    "filters": {
      "priority": ["high", "medium"]
    }
  }
}

// Notification received
{
  "type": "notification",
  "id": "evt_123",
  "payload": {
    "title": "새 메시지",
    "body": "홍길동님이 메시지를 보냈습니다",
    "data": {
      "type": "message",
      "messageId": "msg_456"
    }
  },
  "timestamp": "2024-01-15T09:30:00Z"
}

// Acknowledge receipt
{
  "type": "ack",
  "payload": {
    "eventId": "evt_123"
  }
}
```

**Error Handling**:
```json
{
  "type": "error",
  "payload": {
    "code": "RATE_LIMITED",
    "message": "Too many messages",
    "retryAfter": 5000
  }
}
```

**Reconnection Policy**:
- 연결 끊김 시 지수 백오프로 재연결 (1s, 2s, 4s, 8s, max 30s)
- 재연결 시 마지막 수신 이벤트 ID로 누락 이벤트 요청
- 최대 재시도: 10회 후 사용자에게 알림
```

---

#### 3.5 OpenAPI (Swagger) 자동 생성

PRD에서 정의한 REST API는 OpenAPI 3.1 스펙으로 자동 변환될 수 있습니다:

```yaml
# 생성된 OpenAPI 예시
openapi: 3.1.0
info:
  title: User Authentication API
  version: 1.0.0

paths:
  /api/v1/auth/login:
    post:
      operationId: login
      tags: [Auth]
      security: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/LoginRequest'
      responses:
        '200':
          description: 로그인 성공
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthResponse'
        '401':
          $ref: '#/components/responses/Unauthorized'

components:
  schemas:
    LoginRequest:
      type: object
      required: [email, password]
      properties:
        email:
          type: string
          format: email
        password:
          type: string
          minLength: 8
        rememberMe:
          type: boolean
          default: false
```

**API 문서 생성 도구**:
- Swagger UI: 대화형 API 문서
- Redoc: 깔끔한 문서 UI
- Postman Collection: 테스트 자동화

---

#### API 명세 예시 (로그인)

```markdown
### API: User Authentication

#### `POST /api/v1/auth/login`

**Description**: 사용자 로그인 및 JWT 토큰 발급

**Authentication**: None

**Headers**:
| Header | Required | Description |
|--------|----------|-------------|
| Content-Type | Yes | application/json |

**Request Body**:
```json
{
  "email": "string (required) - 사용자 이메일, 유효한 이메일 형식",
  "password": "string (required) - 비밀번호, 최소 8자",
  "rememberMe": "boolean (optional) - 로그인 유지 여부, default: false"
}
```

**Request Example**:
```json
{
  "email": "user@example.com",
  "password": "MySecurePass123!",
  "rememberMe": true
}
```

**Response 200 OK**:
```json
{
  "success": true,
  "data": {
    "accessToken": "string - JWT 액세스 토큰 (15분)",
    "refreshToken": "string - 리프레시 토큰 (7일, rememberMe시 30일)",
    "expiresIn": "number - 액세스 토큰 만료 시간 (초)",
    "user": {
      "id": "string - 사용자 ID",
      "email": "string - 이메일",
      "name": "string - 이름",
      "role": "string - 역할 (USER | ADMIN)"
    }
  }
}
```

**Response Example**:
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "dGhpcyBpcyBhIHJlZnJl...",
    "expiresIn": 900,
    "user": {
      "id": "usr_abc123",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "USER"
    }
  }
}
```

**Error Responses**:
| Status | Code | Message | When |
|--------|------|---------|------|
| 400 | INVALID_INPUT | Invalid email format | 이메일 형식 오류 |
| 401 | INVALID_CREDENTIALS | Invalid email or password | 이메일/비밀번호 불일치 |
| 403 | ACCOUNT_LOCKED | Account is locked | 5회 이상 로그인 실패 |
| 403 | ACCOUNT_DISABLED | Account is disabled | 비활성화된 계정 |
```
