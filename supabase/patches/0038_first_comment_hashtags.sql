-- "Hashtag'leri ilk yoruma at" — when set, /api/scheduler/publish strips the
-- #hashtags out of the published caption and posts them as a separate first
-- comment right after. Instagram/Facebook only (the only two platforms this
-- codebase already has a proven comment-posting call for, see
-- sendInboxReply.ts) — other platforms just ignore this flag.

alter table public.content_platforms add column if not exists hashtags_as_first_comment boolean not null default false;
