import * as axios from 'axios';
import { DateTime } from 'luxon';
import sharp, { Metadata } from 'sharp';

export async function downloadToBase64(url: string): Promise<string> {
  const response = await axios.default.get(url, {
    responseType: 'arraybuffer',
  });

  return Buffer.from(response.data, 'binary').toString('base64');
}

export async function downloadToBuffer(url: string): Promise<Buffer> {
  const response = await axios.default.get(url, {
    responseType: 'arraybuffer',
  });

  return Buffer.from(response.data, 'utf-8');
}

export async function toBase64(source: string): Promise<string> {
  if (source.startsWith('http')) {
    return await downloadToBase64(source);
  } else {
    return source;
  }
}

export function decodeBase64ToString(base64String: string): string {
  try {
    return decodeURIComponent(atob(base64String));
  } catch (_) {
    return base64String;
  }
}

export async function getImageMetadata(url: string): Promise<Metadata> {
  const buffer = await downloadToBuffer(url);
  return await sharp(buffer).metadata();
}

export function formatDateTime(datetime: string): string {
  let content = datetime;
  const dt = DateTime.fromISO(datetime, { setZone: true });
  if (!dt.isValid) return content;

  const localNow = DateTime.local().setZone(dt.zoneName);

  // Date parse
  // is today
  if (dt.hasSame(localNow, 'day')) {
    content = 'Today, ';
  } else if (dt.diff(localNow, 'day').days === 1) {
    content = 'Tomorrow, ';
  } else {
    content = `${dt.monthShort} ${dt.day}, `;
  }

  // Time parse
  content += `${dt.hour > 12 ? dt.hour - 12 : dt.hour}${dt.minute === 0 ? '' : ':' + dt.minute} ${dt.hour <= 12 ? 'AM' : 'PM'}`;

  return content;
}
