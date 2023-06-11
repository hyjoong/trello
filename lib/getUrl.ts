import { storage } from "@/appwrite";
import { ImageType } from "@/types/boardTypes";

const getUrl = async (image: ImageType) => {
  const url = storage.getFilePreview(image.bucketId, image.fileId);
  return url;
};

export default getUrl;
