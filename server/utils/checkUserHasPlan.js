import { users } from "../database/mongodb/users.js";

export async function checkUserHasPlan(userId) {
   const userInfo = await users.findOne({ _id: userId });

    if (!userInfo) return false;
    
    const isAdmin = userInfo.role === 'admin' || (process.env.ADMIN_USER && userInfo.username === process.env.ADMIN_USER);
    if (isAdmin) return true;

    if (!userInfo.expiresAt || userInfo.expiresAt <= Date.now()) {
        return false;
    }

    return true;
}