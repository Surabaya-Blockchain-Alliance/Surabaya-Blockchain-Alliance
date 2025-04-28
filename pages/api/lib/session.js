export const sessionOptions = {
    password: process.env.SESSION_SECRET,
    cookieName: 'user_profile',
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 1, // 30 days
    },
  };
  