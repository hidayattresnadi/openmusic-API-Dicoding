class PlaylistsHandler {
  constructor(
    playlistService,
    songService,
    playlistSongService,
    playlistSongActivitiesService,
    playlistValidator,
    playlistSongValidator,
  ) {
    this.playlistService = playlistService;
    this.songService = songService;
    this.playlistSongService = playlistSongService;
    this.playlistSongActivitiesService = playlistSongActivitiesService;
    this.playlistValidator = playlistValidator;
    this.playlistSongValidator = playlistSongValidator;
  }

  async postPlaylistHandler(request, h) {
    this.playlistValidator.validatePlaylistPayload(request.payload);
    const { name } = request.payload;
    const { id: credentialId } = request.auth.credentials;
    const playlistId = await this.playlistService.addPlaylist(name, credentialId);

    const response = h.response({
      status: 'success',
      message: 'Playlist berhasil ditambahkan',
      data: {
        playlistId,
      },
    });
    response.code(201);
    return response;
  }

  async getPlaylistsHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const playlists = await this.playlistService.getPlaylists(credentialId);
    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  }

  async deletePlaylistByIdHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;
    await this.playlistService.verifyPlaylistOwner(id, credentialId);
    await this.playlistService.deletePlaylistById(id);
    return {
      status: 'success',
      message: 'Playlist berhasil dihapus',
    };
  }

  async postSongToPlaylistHandler(request, h) {
    const { id } = request.params;
    const { songId } = request.payload;
    const { id: credentialId } = request.auth.credentials;
    const action = 'add';
    this.playlistSongValidator.validatePlaylistSongPayload(request.payload);
    await this.songService.getSongById(songId);
    await this.playlistService.verifyPlaylistAccess(id, credentialId);
    const songPlaylistId = await this.playlistSongService.addSongToPlaylist(songId, id);
    await this.playlistSongActivitiesService.addActivityFromPlaylist(
      id,
      songId,
      credentialId,
      action,
    );

    const response = h.response({
      status: 'success',
      message: 'Song berhasil ditambahkan ke dalam playlist',
      data: {
        songPlaylistId,
      },
    });
    response.code(201);
    return response;
  }

  async getSongFromPlaylistHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;
    await this.playlistService.verifyPlaylistAccess(id, credentialId);
    const playlist = await this.playlistService.getPlaylistById(id);
    return {
      status: 'success',
      data: {
        playlist,
      },
    };
  }

  async deleteSongFromPlaylistHandler(request) {
    const { id } = request.params;
    const { songId } = request.payload;
    const { id: credentialId } = request.auth.credentials;
    const action = 'delete';
    this.playlistSongValidator.validatePlaylistSongPayload(request.payload);
    await this.playlistService.verifyPlaylistAccess(id, credentialId);
    await this.playlistSongService.deleteSongFromPlaylistBySongId(id, songId);
    await this.playlistSongActivitiesService.addActivityFromPlaylist(
      id,
      songId,
      credentialId,
      action,
    );
    return {
      status: 'success',
      message: 'Song berhasil dihapus di dalam playlist',
    };
  }

  async getPlaylistActivities(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;
    await this.playlistService.verifyPlaylistAccess(id, credentialId);
    const activities = await this.playlistSongActivitiesService.getPlaylistWithActivitiesById(id);
    return {
      status: 'success',
      data: activities,
    };
  }
}

module.exports = PlaylistsHandler;
