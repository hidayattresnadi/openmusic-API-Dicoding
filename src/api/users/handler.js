class UsersHandler {
  constructor(service, validator) {
    this.userService = service;
    this.userValidator = validator;
  }

  async postUserHandler(request, h) {
    this.userValidator.validateUserPayload(request.payload);
    const userId = await this.userService.addUser(request.payload);
    const response = h.response({
      status: 'success',
      message: 'User berhasil ditambahkan',
      data: {
        userId,
      },
    });
    response.code(201);
    return response;
  }
}

module.exports = UsersHandler;
