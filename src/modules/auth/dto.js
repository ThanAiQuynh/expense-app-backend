export const toUserDTO = (user) => {
  return {
    id: user.id,
    email: user.email,
    fullName: user.full_name,
    createdAt: user.created_at,
  };
};

export const toTokenDTO = ({
  accessToken,
  refreshToken,
  expiresIn,
  sessionId,
}) => {
  return {
    accessToken,
    refreshToken,
    expiresIn,
    sessionId,
  };
};

export const toLoginResponseDTO = ({
  user,
  accessToken,
  refreshToken,
  sessionId,
  expiresAt,
}) => {
  return {
    user: toUserDTO(user),
    tokens: toTokenDTO({
      accessToken,
      refreshToken,
      expiresIn: Math.floor(
        (new Date(expiresAt).getTime() - Date.now()) / 1000,
      ),
      sessionId,
    }),
    meta: {
      expiresAt: new Date(expiresAt).toISOString(),
    },
  };
};