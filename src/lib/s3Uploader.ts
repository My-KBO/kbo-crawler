import axios from "axios";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import * as dotenv from "dotenv";

dotenv.config();

const s3Client = new S3Client({
  region: "ap-northeast-2",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function uploadToS3(imageUrl: string): Promise<string | null> {
  try {
    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
    const buffer = Buffer.from(response.data, "binary");

    const key = `thumbnails/${uuidv4()}.jpg`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: "mykbo-bucket",
        Key: key,
        Body: buffer,
        ContentType: "image/jpeg",
      })
    );

    return `https://mykbo-bucket.s3.ap-northeast-2.amazonaws.com/${key}`;
  } catch (err) {
    console.error(`이미지 업로드 실패: ${imageUrl}`);
    console.error(err);
    return null;
  }
}
