import type { Config, Context } from "@netlify/functions";
import { eq, asc } from "drizzle-orm";
import { db } from "../../db/index.js";
import { matches, players } from "../../db/schema.js";

async function getOrCreateMatch() {
  const existing = await db.select().from(matches).limit(1);
  if (existing.length > 0) {
    return existing[0];
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateStr = tomorrow.toISOString().split("T")[0];

  const [createdMatch] = await db
    .insert(matches)
    .values({
      title: "Kèo Đá Bóng Sân 7 - Giao Hữu Phủi",
      stadium: "Sân Bóng Phúc Đạt (Sân 7)",
      location: "324 Chu Văn An, P. 12, Q. Bình Thạnh, TP.HCM",
      matchDate: dateStr,
      matchTime: "19:30 - 21:00",
      maxPlayers: 14,
      teamCount: 2,
      status: "OPEN",
      notes: "Anh em đến sớm 10 phút để khởi động và mặc áo theo đội. Mang giày đinh dăm TF!",
      adminPassword: "admin123",
    })
    .returning();

  const defaultPlayers = [
    { id: "p1", name: "Nguyễn Tuấn", note: "Đến đúng giờ", team: 0, sortOrder: 1 },
    { id: "p2", name: "Trần Minh Khoa", note: "Đem 2 quả bóng", team: 0, sortOrder: 2 },
    { id: "p3", name: "Hoàng Nam", note: "", team: 0, sortOrder: 3 },
    { id: "p4", name: "Văn Hưng", note: "", team: 0, sortOrder: 4 },
    { id: "p5", name: "Đức Trí", note: "Trễ 5p", team: 0, sortOrder: 5 },
    { id: "p6", name: "Quốc Bảo", note: "", team: 0, sortOrder: 6 },
    { id: "p7", name: "Thanh Tùng", note: "", team: 0, sortOrder: 7 },
    { id: "p8", name: "Tiến Dũng", note: "", team: 0, sortOrder: 8 },
    { id: "p9", name: "Anh Tuấn", note: "", team: 0, sortOrder: 9 },
    { id: "p10", name: "Hữu Thắng", note: "", team: 0, sortOrder: 10 }
  ];

  for (const p of defaultPlayers) {
    await db.insert(players).values({
      ...p,
      matchId: createdMatch.id,
    });
  }

  return createdMatch;
}

async function getPublicMatchState(matchId: number) {
  const [match] = await db.select().from(matches).where(eq(matches.id, matchId));
  if (!match) return null;

  const matchPlayers = await db
    .select()
    .from(players)
    .where(eq(players.matchId, matchId))
    .orderBy(asc(players.sortOrder), asc(players.createdAt));

  return {
    id: match.id,
    title: match.title,
    stadium: match.stadium,
    location: match.location,
    matchDate: match.matchDate,
    matchTime: match.matchTime,
    maxPlayers: match.maxPlayers,
    teamCount: match.teamCount,
    status: match.status,
    notes: match.notes,
    hasPasswordSet: Boolean(match.adminPassword),
    lastUpdated: match.lastUpdated ? match.lastUpdated.toISOString() : new Date().toISOString(),
    players: matchPlayers.map((p) => ({
      id: p.id,
      name: p.name,
      note: p.note,
      team: p.team,
      createdAt: p.createdAt ? p.createdAt.toISOString() : new Date().toISOString(),
    })),
  };
}

function verifyAdmin(req: Request, adminPassword: string) {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.replace("Bearer ", "").trim();
  return token === adminPassword;
}

export default async (req: Request, context: Context) => {
  try {
    const url = new URL(req.url);
    let pathname = url.pathname.replace(/\/$/, "");
    if (pathname.startsWith("/.netlify/functions/api")) {
      pathname = pathname.replace("/.netlify/functions/api", "/api");
    }
    const method = req.method.toUpperCase();

    // Ensure database has a match record
    const currentMatch = await getOrCreateMatch();

    // 1. GET /api/match or /api
    if ((pathname === "/api/match" || pathname === "/api") && method === "GET") {
      const publicState = await getPublicMatchState(currentMatch.id);
      return Response.json({ success: true, data: publicState });
    }

    // Parse JSON body for POST requests
    let body: any = {};
    if (method === "POST") {
      try {
        body = await req.json();
      } catch {
        body = {};
      }
    }

    // 2. POST /api/player/join
    if (pathname === "/api/player/join" && method === "POST") {
      const { name, note } = body;
      if (!name || !name.trim()) {
        return Response.json(
          { success: false, message: "Vui lòng nhập tên của bạn!" },
          { status: 400 }
        );
      }

      const cleanName = name.trim();
      const existingPlayers = await db
        .select()
        .from(players)
        .where(eq(players.matchId, currentMatch.id));

      const exists = existingPlayers.some(
        (p) => p.name.toLowerCase() === cleanName.toLowerCase()
      );
      if (exists) {
        return Response.json(
          {
            success: false,
            message: "Tên này đã có trong danh sách! Bạn có thể thêm số hoặc họ để phân biệt.",
          },
          { status: 400 }
        );
      }

      if (currentMatch.status === "LOCKED") {
        return Response.json(
          { success: false, message: "Danh sách đã bị khóa bởi quản trị viên!" },
          { status: 400 }
        );
      }

      const newPlayer = {
        id: "p_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
        matchId: currentMatch.id,
        name: cleanName,
        note: note ? note.trim() : "",
        team: 0,
        sortOrder: existingPlayers.length + 1,
      };

      await db.insert(players).values(newPlayer);
      await db
        .update(matches)
        .set({ lastUpdated: new Date() })
        .where(eq(matches.id, currentMatch.id));

      const publicState = await getPublicMatchState(currentMatch.id);
      return Response.json({
        success: true,
        player: {
          id: newPlayer.id,
          name: newPlayer.name,
          note: newPlayer.note,
          team: newPlayer.team,
          createdAt: new Date().toISOString(),
        },
        data: publicState,
      });
    }

    // 3. POST /api/player/leave
    if (pathname === "/api/player/leave" && method === "POST") {
      const { playerId } = body;
      if (!playerId) {
        return Response.json(
          { success: false, message: "Thiếu thông tin cầu thủ!" },
          { status: 400 }
        );
      }

      await db.delete(players).where(eq(players.id, playerId));
      await db
        .update(matches)
        .set({ lastUpdated: new Date() })
        .where(eq(matches.id, currentMatch.id));

      const publicState = await getPublicMatchState(currentMatch.id);
      return Response.json({
        success: true,
        message: "Đã hủy đăng ký thành công.",
        data: publicState,
      });
    }

    // 4. POST /api/admin/login
    if (pathname === "/api/admin/login" && method === "POST") {
      const { password } = body;
      if (password === currentMatch.adminPassword) {
        return Response.json({ success: true, token: currentMatch.adminPassword });
      }
      return Response.json(
        { success: false, message: "Mật khẩu quản trị viên không chính xác!" },
        { status: 401 }
      );
    }

    // For all remaining /api/admin/* endpoints, verify admin privileges
    if (pathname.startsWith("/api/admin/")) {
      if (!verifyAdmin(req, currentMatch.adminPassword)) {
        return Response.json(
          { success: false, message: "Chưa xác thực quyền Admin!" },
          { status: 403 }
        );
      }

      // 5. POST /api/admin/update-match
      if (pathname === "/api/admin/update-match" && method === "POST") {
        const updateData: Record<string, any> = { lastUpdated: new Date() };
        if (body.title !== undefined) updateData.title = body.title;
        if (body.stadium !== undefined) updateData.stadium = body.stadium;
        if (body.location !== undefined) updateData.location = body.location;
        if (body.matchDate !== undefined) updateData.matchDate = body.matchDate;
        if (body.matchTime !== undefined) updateData.matchTime = body.matchTime;
        if (body.maxPlayers !== undefined) updateData.maxPlayers = Number(body.maxPlayers);
        if (body.notes !== undefined) updateData.notes = body.notes;
        if (body.status !== undefined) updateData.status = body.status;
        if (body.teamCount !== undefined) updateData.teamCount = Number(body.teamCount);

        await db.update(matches).set(updateData).where(eq(matches.id, currentMatch.id));
        const publicState = await getPublicMatchState(currentMatch.id);
        return Response.json({ success: true, data: publicState });
      }

      // 6. POST /api/admin/random-split
      if (pathname === "/api/admin/random-split" && method === "POST") {
        const teamCount = Number(body.teamCount) || currentMatch.teamCount || 2;
        const currentPlayers = await db
          .select()
          .from(players)
          .where(eq(players.matchId, currentMatch.id));

        if (currentPlayers.length < 2) {
          return Response.json(
            { success: false, message: "Cần ít nhất 2 cầu thủ để chia đội!" },
            { status: 400 }
          );
        }

        // Fisher-Yates shuffle algorithm
        const shuffled = [...currentPlayers];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        for (let i = 0; i < shuffled.length; i++) {
          const p = shuffled[i];
          const assignedTeam = (i % teamCount) + 1;
          await db
            .update(players)
            .set({ team: assignedTeam, sortOrder: i + 1 })
            .where(eq(players.id, p.id));
        }

        await db
          .update(matches)
          .set({
            teamCount,
            status: "BALANCED",
            lastUpdated: new Date(),
          })
          .where(eq(matches.id, currentMatch.id));

        const publicState = await getPublicMatchState(currentMatch.id);
        return Response.json({ success: true, data: publicState });
      }

      // 7. POST /api/admin/update-player-team
      if (pathname === "/api/admin/update-player-team" && method === "POST") {
        const { playerId, team } = body;
        await db
          .update(players)
          .set({ team: Number(team) })
          .where(eq(players.id, playerId));

        await db
          .update(matches)
          .set({ lastUpdated: new Date() })
          .where(eq(matches.id, currentMatch.id));

        const publicState = await getPublicMatchState(currentMatch.id);
        return Response.json({ success: true, data: publicState });
      }

      // 8. POST /api/admin/swap-players
      if (pathname === "/api/admin/swap-players" && method === "POST") {
        const { player1Id, player2Id } = body;
        const [p1] = await db.select().from(players).where(eq(players.id, player1Id));
        const [p2] = await db.select().from(players).where(eq(players.id, player2Id));

        if (!p1 || !p2) {
          return Response.json(
            { success: false, message: "Không tìm thấy 1 trong 2 cầu thủ!" },
            { status: 404 }
          );
        }

        await db.update(players).set({ team: p2.team }).where(eq(players.id, p1.id));
        await db.update(players).set({ team: p1.team }).where(eq(players.id, p2.id));

        await db
          .update(matches)
          .set({ lastUpdated: new Date() })
          .where(eq(matches.id, currentMatch.id));

        const publicState = await getPublicMatchState(currentMatch.id);
        return Response.json({ success: true, data: publicState });
      }

      // 9. POST /api/admin/edit-player
      if (pathname === "/api/admin/edit-player" && method === "POST") {
        const { playerId, name } = body;
        if (name && name.trim()) {
          await db
            .update(players)
            .set({ name: name.trim() })
            .where(eq(players.id, playerId));
        }

        await db
          .update(matches)
          .set({ lastUpdated: new Date() })
          .where(eq(matches.id, currentMatch.id));

        const publicState = await getPublicMatchState(currentMatch.id);
        return Response.json({ success: true, data: publicState });
      }

      // 10. POST /api/admin/delete-player
      if (pathname === "/api/admin/delete-player" && method === "POST") {
        const { playerId } = body;
        await db.delete(players).where(eq(players.id, playerId));

        await db
          .update(matches)
          .set({ lastUpdated: new Date() })
          .where(eq(matches.id, currentMatch.id));

        const publicState = await getPublicMatchState(currentMatch.id);
        return Response.json({ success: true, data: publicState });
      }

      // 11. POST /api/admin/add-player
      if (pathname === "/api/admin/add-player" && method === "POST") {
        const { name, team } = body;
        if (!name || !name.trim()) {
          return Response.json(
            { success: false, message: "Vui lòng nhập tên!" },
            { status: 400 }
          );
        }

        const existingPlayers = await db
          .select()
          .from(players)
          .where(eq(players.matchId, currentMatch.id));

        const newPlayer = {
          id: "p_admin_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
          matchId: currentMatch.id,
          name: name.trim(),
          note: "",
          team: Number(team) || 0,
          sortOrder: existingPlayers.length + 1,
        };

        await db.insert(players).values(newPlayer);
        await db
          .update(matches)
          .set({ lastUpdated: new Date() })
          .where(eq(matches.id, currentMatch.id));

        const publicState = await getPublicMatchState(currentMatch.id);
        return Response.json({
          success: true,
          player: {
            id: newPlayer.id,
            name: newPlayer.name,
            team: newPlayer.team,
            createdAt: new Date().toISOString(),
          },
          data: publicState,
        });
      }

      // 12. POST /api/admin/reset-teams
      if (pathname === "/api/admin/reset-teams" && method === "POST") {
        await db
          .update(players)
          .set({ team: 0 })
          .where(eq(players.matchId, currentMatch.id));

        await db
          .update(matches)
          .set({ status: "OPEN", lastUpdated: new Date() })
          .where(eq(matches.id, currentMatch.id));

        const publicState = await getPublicMatchState(currentMatch.id);
        return Response.json({ success: true, data: publicState });
      }

      // 13. POST /api/admin/clear-players
      if (pathname === "/api/admin/clear-players" && method === "POST") {
        await db.delete(players).where(eq(players.matchId, currentMatch.id));

        await db
          .update(matches)
          .set({ status: "OPEN", lastUpdated: new Date() })
          .where(eq(matches.id, currentMatch.id));

        const publicState = await getPublicMatchState(currentMatch.id);
        return Response.json({ success: true, data: publicState });
      }

      // 14. POST /api/admin/change-password
      if (pathname === "/api/admin/change-password" && method === "POST") {
        const { newPassword } = body;
        if (!newPassword || newPassword.trim().length < 4) {
          return Response.json(
            { success: false, message: "Mật khẩu mới tối thiểu 4 ký tự!" },
            { status: 400 }
          );
        }

        await db
          .update(matches)
          .set({
            adminPassword: newPassword.trim(),
            lastUpdated: new Date(),
          })
          .where(eq(matches.id, currentMatch.id));

        return Response.json({
          success: true,
          message: "Đổi mật khẩu Admin thành công!",
        });
      }
    }

    return Response.json(
      { success: false, message: "Endpoint not found: " + pathname },
      { status: 404 }
    );
  } catch (err: any) {
    console.error("API Error:", err);
    return Response.json(
      { success: false, message: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
};

export const config: Config = {
  path: "/api/*",
};
