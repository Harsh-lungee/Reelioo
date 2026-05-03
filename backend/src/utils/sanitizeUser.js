export default function sanitizeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    profilePic: user.profilePic,
    bio: user.bio,
    skillTitle: user.skillTitle,
    location: user.location,
    followers: user.followers,
    following: user.following,
    followersCount: user.followersCount,
    followingCount: user.followingCount,
    postsCount: user.postsCount,
    completedWorkCount: user.completedWorkCount,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
