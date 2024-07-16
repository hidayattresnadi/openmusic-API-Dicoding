class AuthenticationsHandler {
  constructor(authenticationService, usersService, tokenManager, authenticationValidator) {
    this.authenticationService = authenticationService;
    this.usersService = usersService;
    this.tokenManager = tokenManager;
    this.authenticationValidator = authenticationValidator;
  }

  async postAuthenticationHandler(request, h) {
    this.authenticationValidator.validatePostAuthenticationPayload(request.payload);
    const id = await this.usersService.verifyUserCredential(request.payload);
    const accessToken = this.tokenManager.generateAccessToken({ id });
    const refreshToken = this.tokenManager.generateRefreshToken({ id });
    await this.authenticationService.addRefreshToken(refreshToken);
    const response = h.response({
      status: 'success',
      message: 'Authentication berhasil ditambahkan',
      data: {
        accessToken,
        refreshToken,
      },
    });
    response.code(201);
    return response;
  }

  async putAuthenticationHandler(request) {
    this.authenticationValidator.validatePutAuthenticationPayload(request.payload);
    const { refreshToken } = request.payload;
    await this.authenticationService.verifyRefreshToken(refreshToken);
    const { id } = this.tokenManager.verifyRefreshToken(refreshToken);
    const accessToken = this.tokenManager.generateAccessToken({ id });
    return {
      status: 'success',
      message: 'Access Token berhasil diperbarui',
      data: {
        accessToken,
      },
    };
  }

  async deleteAuthenticationHandler(request) {
    this.authenticationValidator.validateDeleteAuthenticationPayload(request.payload);
    const { refreshToken } = request.payload;
    await this.authenticationService.verifyRefreshToken(refreshToken);
    await this.authenticationService.deleteRefreshToken(refreshToken);
    return {
      status: 'success',
      message: 'Refresh token berhasil dihapus',
    };
  }
}

module.exports = AuthenticationsHandler;
