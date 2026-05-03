export function getStoredUser() {
  const storedUser = localStorage.getItem("reelioUser");

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser);
  } catch (error) {
    return null;
  }
}

export function getDisplayName(user) {
  if (!user?.name) {
    return "there";
  }

  return user.name.split(" ")[0];
}
