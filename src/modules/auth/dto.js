export const toUserResponseDTO = (user) => {
    return {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        createdAt: user.created_at
    };
};
