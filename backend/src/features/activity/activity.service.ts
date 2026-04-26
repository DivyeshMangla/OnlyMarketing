// activity.service.ts — Shared activity logging and lookup helpers.
import { Types } from 'mongoose';
import { ActivityRecord } from './Activity.model';
import { ActivityRecordDto, CreateActivityRecordBody } from './activity.types';

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function toActivityDto(record: {
  _id: Types.ObjectId;
  type: string;
  desc: string;
  date: Date;
  performedBy: string;
  performedById?: Types.ObjectId;
  contactName: string;
}): ActivityRecordDto {
  return {
    id: record._id.toString(),
    type: record.type,
    desc: record.desc,
    date: formatDate(record.date),
    performedBy: record.performedBy,
    performedById: record.performedById?.toString(),
    contactName: record.contactName,
  };
}

export async function recordActivity(data: CreateActivityRecordBody): Promise<ActivityRecordDto> {
  const activity = await ActivityRecord.create({
    ...data,
    date: data.date ?? new Date(),
  });
  return toActivityDto(activity.toObject());
}

export async function getActivitiesByUserIds(userIds: Array<string | Types.ObjectId>): Promise<ActivityRecordDto[]> {
  if (userIds.length === 0) return [];

  const objectIds = userIds
    .filter((id) => Types.ObjectId.isValid(id.toString()))
    .map((id) => new Types.ObjectId(id.toString()));

  if (objectIds.length === 0) return [];

  const activities = await ActivityRecord.find({ performedById: { $in: objectIds } })
    .sort({ date: -1, createdAt: -1 })
    .limit(250)
    .lean();

  return activities.map(toActivityDto);
}
