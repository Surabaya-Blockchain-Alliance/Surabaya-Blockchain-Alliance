const JWT = process.env.NEXT_PUBLIC_Pinata_JWT;
const PINATA_GATEWAY = 'https://sapphire-managing-narwhal-834.mypinata.cloud';
const FALLBACK_GATEWAY = 'https://ipfs.io';

export const uploadFile = async (file, retries = 3) => {
  if (!file) {
    throw new Error('No file provided.');
  }

  const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid file type. Only JPEG, PNG, and GIF are supported.');
  }

  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error('File size exceeds 5MB limit.');
  }

  if (!JWT) {
    throw new Error('Pinata JWT is missing. Check .env.local.');
  }

  let lastError = null;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('pinataMetadata', JSON.stringify({
        name: file.name,
        keyvalues: { uploadedBy: 'MintNFTPage' },
      }));
      formData.append('network', 'public');

      const response = await fetch('https://uploads.pinata.cloud/v3/files', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${JWT}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Pinata API error: ${errorData.message || response.statusText}`);
      }

      const data = await response.json();
      const cid = data.data?.cid;
      if (!cid) {
        throw new Error('No IPFS hash returned from Pinata.');
      }

      const ipfsUrl = `ipfs://${cid}`;
      const gatewayUrl = `${PINATA_GATEWAY}/ipfs/${cid}`;
      console.log(`Upload successful (attempt ${attempt}):`, { cid, ipfsUrl, gatewayUrl });
      return { cid, ipfsUrl, gatewayUrl };
    } catch (error) {
      lastError = error;
      console.error(`Upload attempt ${attempt} failed:`, {
        message: error.message,
        status: error.status,
      });

      if (attempt < retries && error.message.includes('Network Error')) {
        console.log(`Retrying... (${attempt + 1}/${retries})`);
        await new Promise((resolve) => setTimeout(resolve, 2000 * attempt));
        continue;
      }

      throw new Error(`Failed to upload to Pinata: ${error.message}`);
    }
  }

  throw new Error(`Failed to upload to Pinata after ${retries} attempts: ${lastError.message}`);
};