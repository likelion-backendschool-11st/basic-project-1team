export class AppError extends Error {
  constructor(status, code, message) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.code = code;
  }
}

export class BadRequestError extends AppError {
  constructor(code = 'BAD_REQUEST', message = '잘못된 요청입니다.') {
    super(400, code, message);
  }
}

export class UnauthorizedError extends AppError {
  constructor(code = 'UNAUTHORIZED', message = '로그인이 필요합니다.') {
    super(401, code, message);
  }
}

export class ForbiddenError extends AppError {
  constructor(code = 'FORBIDDEN', message = '권한이 없습니다.') {
    super(403, code, message);
  }
}

export class NotFoundError extends AppError {
  constructor(code = 'NOT_FOUND', message = '리소스를 찾을 수 없습니다.') {
    super(404, code, message);
  }
}

export class ConflictError extends AppError {
  constructor(code = 'CONFLICT', message = '이미 존재하는 리소스입니다.') {
    super(409, code, message);
  }
}
