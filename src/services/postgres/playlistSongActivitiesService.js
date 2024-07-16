const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');

class PlaylistSongActivitiesService {
  constructor(pgPool) {
    this.pgPool = pgPool;
  }

  async addActivityFromPlaylist(playlistId, songId, userId, action) {
    const id = `playlist_song_activity-${nanoid(16)}`;
    const time = new Date().toISOString();
    const query = {
      text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [id, playlistId, songId, userId, action, time],
    };
    const result = await this.pgPool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('aktivitas pada playsong gagal ditambahkan');
    }
    return result.rows[0].id;
  }

  async getPlaylistWithActivitiesById(id) {
    const query = {
      text: `
      SELECT 
      psa.playlist_id, u.username, s.title, psa.action, psa.time  
      FROM playlist_song_activities psa 
      LEFT JOIN users u ON psa.user_id = u.id
      LEFT JOIN songs s ON psa.song_id = s.id
      WHERE psa.playlist_id = $1
      ORDER BY psa.time ASC
    `,
      values: [id],
    };
    const result = await this.pgPool.query(query);
    const playlist = {
      playlistId: result.rows[0].playlist_id,
      activities: result.rows.map((row) => ({
        username: row.username,
        title: row.title,
        action: row.action,
        time: row.time,
      })),
    };

    return playlist;
  }
}

module.exports = PlaylistSongActivitiesService;
