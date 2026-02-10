export const toUserDTO = (user) => {
  return {
    id: user.id,
    email: user.email,
    fullName: user.full_name,
    createdAt: user.created_at,
  };
};

export const toProfileResponseDTO = ({ user, role }) => {
  return {
    user: {
      ...toUserDTO(user), // Lấy id, email, fullName, createdAt
      avatarUrl: user.avatar_url, // Hiện avatar người dùng
      currency: user.currency || 'VND', // Cần thiết để format tiền tệ trong app chi tiêu
      language: user.language || 'vi', // Ngôn ngữ giao diện
      settings: user.settings || {}, // Cấu hình hạn mức, thông báo (jsonb)
    },
    role: role, // Quyền hạn (user/admin)
    lastLoginAt: user.last_login_at ? new Date(user.last_login_at).toISOString() : null
  };
};