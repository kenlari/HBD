import React from "react";
import { motion } from "motion/react";
import { Cake, Gift, MessageCircle, Sparkles, ChevronRight, PartyPopper } from "lucide-react";
import { Friend } from "../types";

// ─────────────────────────────────────────────
// BirthdayDashboard — drop into src/components/
// Shows upcoming birthdays sorted by soonest first
// Props:
//   friends          → Friend[] from App state
//   userName         → logged-in user's name
//   onViewFriend()   → navigate to Registry for that friend
//   onOpenGiftAI()   → navigate to AI Lab
// ─────────────────────────────────────────────

interface BirthdayDashboardProps {
  friends: Friend[];
  userName: string;
  onViewFriend: (friendId: string) => void;
  onOpenGiftAI: (friendId: string) => void;
}

// Days until next birthday helper
function daysUntil(birthdayStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const bDate = new Date(birthdayStr);
  let next = new Date(today.getFullYear(), bDate.getMonth(), bDate.getDate());
  if (next < today) next.setFullYear(today.getFullYear() + 1);
  return Math.ceil((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDate(birthdayStr: string): string {
  const d = new Date(birthdayStr);
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric" });
}

function getUrgencyColor(days: number): string {
  if (days === 0) return "text-yellow-400 bg-yellow-400/10 border-yellow-400/30";
  if (days <= 3) return "text-red-400 bg-red-400/10 border-red-400/30";
  if (days <= 7) return "text-orange-400 bg-orange-400/10 border-orange-400/30";
  if (days <= 30) return "text-indigo-400 bg-indigo-400/10 border-indigo-400/30";
  return "text-slate-400 bg-slate-800/50 border-slate-700/30";
}

function getDaysLabel(days: number): string {
  if (days === 0) return "🎉 Today!";
  if (days === 1) return "Tomorrow!";
  return `${days} days`;
}

// WhatsApp send helper
function openWhatsApp(friend: Friend) {
  const phone = (friend as any).whatsapp || (friend as any).phone || "";
  const msg = encodeURIComponent(
    `🎉 Happy Birthday ${friend.name.replace(" (You)", "")}! 🎂 Wishing you an incredible day filled with joy and celebration! 🥳`
  );
  if (phone) {
    const cleaned = phone.replace(/\D/g, "");
    window.open(`https://wa.me/${cleaned}?text=${msg}`, "_blank");
  } else {
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  }
}

export function BirthdayDashboard({
  friends,
  userName,
  onViewFriend,
  onOpenGiftAI,
}: BirthdayDashboardProps) {
  // Sort friends by upcoming birthday, exclude self
  const sorted = [...friends]
    .filter((f) => f.id !== "alex")
    .sort((a, b) => daysUntil(a.birthday) - daysUntil(b.birthday));

  const todayBirthdays = sorted.filter((f) => daysUntil(f.birthday) === 0);
  const soonBirthdays = sorted.filter((f) => {
    const d = daysUntil(f.birthday);
    return d > 0 && d <= 30;
  });
  const laterBirthdays = sorted.filter((f) => daysUntil(f.birthday) > 30);

  const firstName = userName.split(" ")[0];

  return (
    <div className="space-y-6">

      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-600/20 via-slate-900 to-teal-600/10 border border-indigo-500/20 rounded-2xl p-5"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-600/30">
            {firstName[0].toUpperCase()}
          </div>
          <div>
            <h2 className="font-black text-white text-base">
              Hey {firstName}! 👋
            </h2>
            <p className="text-xs text-slate-400">
              {sorted.length === 0
                ? "Add friends to track their birthdays"
                : `You have ${sorted.length} friend${sorted.length > 1 ? "s" : ""} to track`}
            </p>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-slate-900/60 rounded-xl p-3 text-center border border-slate-800/60">
            <div className="text-lg font-black text-indigo-400">{sorted.length}</div>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Friends</div>
          </div>
          <div className="bg-slate-900/60 rounded-xl p-3 text-center border border-slate-800/60">
            <div className="text-lg font-black text-yellow-400">{todayBirthdays.length}</div>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Today</div>
          </div>
          <div className="bg-slate-900/60 rounded-xl p-3 text-center border border-slate-800/60">
            <div className="text-lg font-black text-orange-400">{soonBirthdays.length}</div>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">This Month</div>
          </div>
        </div>
      </motion.div>

      {/* TODAY'S Birthdays */}
      {todayBirthdays.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <PartyPopper className="w-4 h-4 text-yellow-400" />
            <h3 className="text-xs font-black text-yellow-400 uppercase tracking-widest">
              Today's Birthdays 🎂
            </h3>
          </div>
          <div className="space-y-2">
            {todayBirthdays.map((friend, i) => (
              <FriendBirthdayCard
                key={friend.id}
                friend={friend}
                days={0}
                index={i}
                onViewFriend={onViewFriend}
                onOpenGiftAI={onOpenGiftAI}
                openWhatsApp={openWhatsApp}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* COMING SOON — within 30 days */}
      {soonBirthdays.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Cake className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest">
              Coming Up Soon
            </h3>
          </div>
          <div className="space-y-2">
            {soonBirthdays.map((friend, i) => (
              <FriendBirthdayCard
                key={friend.id}
                friend={friend}
                days={daysUntil(friend.birthday)}
                index={i}
                onViewFriend={onViewFriend}
                onOpenGiftAI={onOpenGiftAI}
                openWhatsApp={openWhatsApp}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* LATER birthdays */}
      {laterBirthdays.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Cake className="w-4 h-4 text-slate-500" />
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">
              Later This Year
            </h3>
          </div>
          <div className="space-y-2">
            {laterBirthdays.map((friend, i) => (
              <FriendBirthdayCard
                key={friend.id}
                friend={friend}
                days={daysUntil(friend.birthday)}
                index={i}
                onViewFriend={onViewFriend}
                onOpenGiftAI={onOpenGiftAI}
                openWhatsApp={openWhatsApp}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Empty state */}
      {sorted.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 space-y-3"
        >
          <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto">
            <Cake className="w-8 h-8 text-slate-600" />
          </div>
          <h4 className="font-bold text-slate-400 text-sm">No friends added yet</h4>
          <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
            Go to the Buddies tab to search and add friends so you never miss their birthday!
          </p>
        </motion.div>
      )}
    </div>
  );
}

// ─── Individual Friend Birthday Card ───────────

interface FriendBirthdayCardProps {
  friend: Friend;
  days: number;
  index: number;
  onViewFriend: (id: string) => void;
  onOpenGiftAI: (id: string) => void;
  openWhatsApp: (friend: Friend) => void;
}

function FriendBirthdayCard({
  friend,
  days,
  index,
  onViewFriend,
  onOpenGiftAI,
  openWhatsApp,
}: FriendBirthdayCardProps) {
  const urgencyClass = getUrgencyColor(days);
  const isToday = days === 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`bg-slate-900/80 border rounded-2xl p-4 flex items-center gap-3 group transition-all hover:border-indigo-500/30 ${
        isToday ? "border-yellow-400/30 bg-yellow-400/5" : "border-slate-800"
      }`}
    >
      {/* Avatar */}
      <div
        className={`w-11 h-11 ${friend.avatar} rounded-xl flex items-center justify-center text-white font-black text-base shadow-lg flex-shrink-0`}
      >
        {friend.name.replace(" (You)", "")[0].toUpperCase()}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-sm text-white truncate">
            {friend.name.replace(" (You)", "")}
          </span>
          {isToday && (
            <span className="text-[9px] bg-yellow-400/20 text-yellow-300 font-bold px-1.5 py-0.5 rounded-full border border-yellow-400/30 animate-pulse">
              🎉 TODAY
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-[10px] text-slate-500">{formatDate(friend.birthday)}</span>
          <span className="text-[10px] text-slate-600">·</span>
          <span className="text-[10px] text-slate-500 capitalize">{friend.relationship}</span>
          {friend.wishlist.length > 0 && (
            <>
              <span className="text-[10px] text-slate-600">·</span>
              <span className="text-[10px] text-indigo-400 flex items-center gap-0.5">
                <Gift className="w-2.5 h-2.5" />
                {friend.wishlist.length} wish{friend.wishlist.length > 1 ? "es" : ""}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Days badge */}
      <div className={`text-[10px] font-black px-2.5 py-1.5 rounded-xl border flex-shrink-0 text-center min-w-[52px] ${urgencyClass}`}>
        {getDaysLabel(days)}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {/* WhatsApp */}
        <button
          onClick={() => openWhatsApp(friend)}
          title="Send WhatsApp birthday message"
          className="w-8 h-8 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 hover:border-green-500/40 rounded-xl flex items-center justify-center transition-all"
        >
          <MessageCircle className="w-3.5 h-3.5 text-green-400" />
        </button>

        {/* Gift AI */}
        <button
          onClick={() => onOpenGiftAI(friend.id)}
          title="Get AI gift ideas"
          className="w-8 h-8 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 hover:border-indigo-500/40 rounded-xl flex items-center justify-center transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
        </button>

        {/* View Profile */}
        <button
          onClick={() => onViewFriend(friend.id)}
          title="View profile"
          className="w-8 h-8 bg-slate-800 hover:bg-slate-700 rounded-xl flex items-center justify-center transition-all"
        >
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>
    </motion.div>
  );
}
