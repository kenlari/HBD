import React from "react";
import { motion } from "motion/react";
import { Cake, Gift, MessageCircle, Sparkles, ChevronRight, PartyPopper } from "lucide-react";
import { Friend } from "../types";

// ─────────────────────────────────────────────
// BirthdayDashboard — drop into src/components/
// Shows upcoming birthdays sorted by soonest first
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
  if (days === 0) return "text-amber-800 bg-amber-50/70 border-amber-200/50";
  if (days <= 3) return "text-rose-700 bg-rose-50/50 border-rose-100";
  if (days <= 7) return "text-orange-700 bg-orange-50/50 border-orange-100";
  if (days <= 30) return "text-indigo-700 bg-indigo-50/50 border-indigo-100";
  return "text-slate-500 bg-slate-50/50 border-slate-100";
}

function getDaysLabel(days: number): string {
  if (days === 0) return "🎉 Today";
  if (days === 1) return "Tomorrow";
  return `${days} days`;
}

// WhatsApp send helper
function openWhatsApp(friend: Friend) {
  const phone = (friend as any).whatsapp || (friend as any).phone || "";
  const msg = encodeURIComponent(
    `🎉 Happy Birthday ${friend.name.replace(" (You)", "")}! Wishing you an incredible day! 🎂💖`
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
    <div className="space-y-8">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-slate-100 p-8 rounded-3xl"
      >
        <div className="flex items-center gap-4 text-left">
          <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-800 font-bold text-lg shrink-0 border border-slate-100">
            {firstName ? firstName[0].toUpperCase() : "U"}
          </div>
          <div>
            <h2 className="font-semibold text-slate-900 text-sm md:text-base tracking-tight">
              Hey {firstName}! 👋
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5 font-medium leading-relaxed">
              {sorted.length === 0
                ? "Add friends to track their birthdays"
                : `You're tracking ${sorted.length} friend${sorted.length > 1 ? "s" : ""} in your circle.`}
            </p>
          </div>
        </div>

        {/* Quick stats with no shadows, extremely minimal */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-slate-50/50 border border-slate-100/60 rounded-2xl p-4 text-center transition-all hover:bg-slate-50">
            <div className="text-lg font-bold text-slate-900 tracking-tight font-sans">{sorted.length}</div>
            <div className="text-[9px] text-slate-400 font-semibold uppercase tracking-widest mt-1">Buddies</div>
          </div>
          <div className="bg-slate-50/50 border border-slate-100/60 rounded-2xl p-4 text-center transition-all hover:bg-slate-50">
            <div className="text-lg font-bold text-amber-600 tracking-tight font-sans">{todayBirthdays.length}</div>
            <div className="text-[9px] text-slate-400 font-semibold uppercase tracking-widest mt-1">Today</div>
          </div>
          <div className="bg-slate-50/50 border border-slate-100/60 rounded-2xl p-4 text-center transition-all hover:bg-slate-50">
            <div className="text-lg font-bold text-indigo-600 tracking-tight font-sans">{soonBirthdays.length}</div>
            <div className="text-[9px] text-slate-400 font-semibold uppercase tracking-widest mt-1">Next 30 Days</div>
          </div>
        </div>
      </motion.div>

      {/* TODAY'S Birthdays */}
      {todayBirthdays.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="space-y-3.5"
        >
          <div className="flex items-center gap-2 mb-1 px-1 text-left">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
              Today's Celebrations
            </h3>
          </div>
          <div className="space-y-3">
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
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3.5"
        >
          <div className="flex items-center gap-2 mb-1 px-1 text-left">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
              Coming Up Next
            </h3>
          </div>
          <div className="space-y-3">
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
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-3.5"
        >
          <div className="flex items-center gap-2 mb-1 px-1 text-left">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
              Later This Year
            </h3>
          </div>
          <div className="space-y-3">
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
          className="bg-white border border-slate-100 rounded-3xl text-center py-20 space-y-5"
        >
          <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
            <Cake className="w-6 h-6 text-slate-400" />
          </div>
          <div className="space-y-1.5">
            <h4 className="font-semibold text-slate-800 text-xs">No buddies added yet</h4>
            <p className="text-[11px] text-slate-400 max-w-xs mx-auto leading-relaxed">
              Activate the Buddies Registry to import or register your companions' birthday schedules!
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ─── Individual Friend Birthday Card ───────────
interface FriendBirthdayCardProps {
  key?: string;
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
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className={`bg-white border rounded-2xl p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-200 text-left hover:border-slate-300 ${
        isToday ? "border-amber-200 bg-amber-50/5" : "border-slate-100"
      }`}
    >
      <div className="flex items-center gap-4 min-w-0">
        {/* Avatar */}
        <div
          className={`w-10 h-10 ${friend.avatar || "bg-indigo-600"} rounded-xl flex items-center justify-center text-white font-bold text-xs shrink-0`}
        >
          {friend.name.replace(" (You)", "")[0].toUpperCase()}
        </div>

        {/* Info */}
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-xs text-slate-900 tracking-tight">
              {friend.name.replace(" (You)", "")}
            </span>
            {isToday && (
              <span className="text-[8px] bg-amber-500/10 text-amber-700 font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                Today 🎉
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1 text-slate-400 text-[10px] font-normal tracking-tight flex-wrap">
            <span>{formatDate(friend.birthday)}</span>
            <span>•</span>
            <span className="capitalize">{friend.relationship}</span>
            {friend.wishlist && friend.wishlist.length > 0 && (
              <>
                <span>•</span>
                <span className="text-indigo-600 font-semibold flex items-center gap-0.5">
                  <Gift className="w-2.5 h-2.5" />
                  {friend.wishlist.length} wish{friend.wishlist.length > 1 ? "es" : ""}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-3.5 shrink-0">
        {/* Days badge */}
        <div className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg border flex-shrink-0 tracking-tight font-mono ${urgencyClass}`}>
          {getDaysLabel(days)}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5">
          {/* WhatsApp */}
          <button
            onClick={() => openWhatsApp(friend)}
            title="Send WhatsApp greeting"
            className="w-8 h-8 bg-green-500/5 hover:bg-green-500 text-green-600 hover:text-white border border-green-500/10 hover:border-transparent rounded-xl flex items-center justify-center transition-all duration-205 cursor-pointer"
          >
            <MessageCircle className="w-3.5 h-3.5" />
          </button>

          {/* Gift AI */}
          <button
            onClick={() => onOpenGiftAI(friend.id)}
            title="Get AI gift ideas"
            className="w-8 h-8 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white border border-indigo-100 hover:border-transparent rounded-xl flex items-center justify-center transition-all duration-205 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
          </button>

          {/* View Profile */}
          <button
            onClick={() => onViewFriend(friend.id)}
            title="View profile"
            className="w-8 h-8 bg-slate-50 hover:bg-slate-900 text-slate-500 hover:text-white border border-slate-100 hover:border-transparent rounded-xl flex items-center justify-center cursor-pointer transition-all duration-205"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

