const sessions = {};

export function getSession(userId) {
  if (!sessions[userId]) {
    sessions[userId] = {
      step: "START",
      data: {}
    };
  }
  return sessions[userId];
}

export function updateSession(userId, session) {
  sessions[userId] = session;
}

export function clearSession(userId) {
  delete sessions[userId];
}