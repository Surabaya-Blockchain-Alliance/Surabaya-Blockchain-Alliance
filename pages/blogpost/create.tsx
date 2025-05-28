import { useEffect, useState, useRef } from 'react';
import { db, auth } from '@/config';
import { collection, getDocs, getDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/router';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { uploadFile } from '@/utils/upload';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Cropper from 'react-easy-crop';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import Modal from 'react-modal';

Modal.setAppElement('#__next');

export default function CreateBlog() {
  const [user, setUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [resizeWidth, setResizeWidth] = useState<number>(800);
  const router = useRouter();
  const cropperRef = useRef<any>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: {},
        blockquote: {},
        bulletList: {},
        orderedList: {},
      }),
      Image,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-blue-600 underline' },
      }),
      TextStyle,
      Color,
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[400px] p-4 border rounded bg-white',
      },
    },
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
      } else {
        router.push('/signin');
      }
      setCheckingAuth(false);
    });

    return () => unsubscribe();
  }, [router]);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; 
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf', 'video/mp4', 'video/webm'];

  const handleFileUpload = async () => {
    if (!user) {
      toast.error('You must be logged in to upload files.');
      return;
    }

    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*,application/pdf,video/*');
    input.click();
    input.onchange = async (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file || !editor) return;

      if (file.size > MAX_FILE_SIZE) {
        toast.error('File size exceeds 5MB limit.');
        return;
      }
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error('Unsupported file type. Allowed: JPEG, PNG, PDF, MP4, WebM.');
        return;
      }

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          setSelectedImage(reader.result as string);
          setIsImageModalOpen(true);
        };
        reader.readAsDataURL(file);
      } else {
        setLoading(true);
        try {
          const { gatewayUrl } = await uploadFile(file);
          console.log('Uploaded file URL:', gatewayUrl);
          if (file.type === 'application/pdf') {
            editor
              .chain()
              .focus()
              .insertContent(`<a href="${gatewayUrl}" target="_blank" class="text-blue-600 underline">${file.name}</a>`)
              .run();
          } else if (file.type.startsWith('video/')) {
            editor.chain().focus().insertContent(`<video src="${gatewayUrl}" controls class="w-full max-w-md"></video>`).run();
          }
          toast.success('File uploaded successfully!');
        } catch (error) {
          console.error('Error uploading file:', error);
          toast.error('File upload failed: ' + (error as Error).message);
        } finally {
          setLoading(false);
        }
      }
    };
  };

  const onCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const getCroppedImg = async (imageSrc: string, pixelCrop: any, resizeWidth: number): Promise<Blob> => {
    const image = new window.Image();
    image.src = imageSrc;
    await new Promise((resolve) => (image.onload = resolve));

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    const aspectRatio = pixelCrop.width / pixelCrop.height;
    canvas.width = resizeWidth;
    canvas.height = resizeWidth / aspectRatio;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      canvas.width,
      canvas.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.9);
    });
  };

  const handleImageProcess = async () => {
    if (!selectedImage || !croppedAreaPixels) {
      toast.error('Please select a crop area.');
      return;
    }

    setLoading(true);
    try {
      const croppedBlob = await getCroppedImg(selectedImage, croppedAreaPixels, resizeWidth);
      const croppedFile = new File([croppedBlob], 'cropped-image.jpg', { type: 'image/jpeg' });
      const { gatewayUrl } = await uploadFile(croppedFile);
      console.log('Uploaded image URL:', gatewayUrl);
      editor?.chain().focus().setImage({ src: gatewayUrl, alt: 'Uploaded image' }).run();
      toast.success('Image uploaded successfully!');
      setIsImageModalOpen(false);
      setSelectedImage(null);
      setCroppedAreaPixels(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setResizeWidth(800);
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error('Image processing failed: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !editor?.getJSON()) {
      toast.error('Title and content are required.');
      return;
    }

    setLoading(true);
    try {
      let author = 'Anonymous';
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          author = userSnap.data().username || 'Anonymous';
        }
      }

      const postsRef = collection(db, 'blogposts');
      const postsSnap = await getDocs(postsRef);
      let newId = 1;
      let slug = generateSlug(title);
      if (!postsSnap.empty) {
        const allPosts = postsSnap.docs.map((doc) => doc.data());
        newId = Math.max(...allPosts.map((post) => post.postNumber || 0)) + 1;
        let slugIndex = 1;
        let tempSlug = slug;
        while (allPosts.some((post) => post.slug === tempSlug)) {
          tempSlug = `${slug}-${slugIndex}`;
          slugIndex++;
        }
        slug = tempSlug;
      }

      const blogPostData = {
        title,
        content: editor.getJSON(),
        createdAt: serverTimestamp(),
        likes: 0,
        author,
        postNumber: newId,
        likedBy: [],
        slug,
      };
      console.log('Blog post data:', blogPostData);
      const blogPostRef = doc(db, 'blogposts', newId.toString());
      await setDoc(blogPostRef, blogPostData);

      router.push(`/blogpost/${newId}`);
      toast.success('Post created successfully!');
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Post creation failed: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      <div className="flex-grow flex justify-center px-4 py-10">
        <div className="w-full max-w-4xl bg-white p-6 rounded-lg shadow-md">
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Enter your title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-4xl font-bold text-gray-900 mb-6 focus:outline-none placeholder-gray-400 bg-white"
              required
            />
            <div className="mb-4 flex flex-wrap gap-2 p-2 bg-gray-100 rounded-lg">
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                className={`px-2 py-1 rounded ${editor?.isActive('heading', { level: 1 }) ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}
                title="Heading 1"
              >
                H1
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`px-2 py-1 rounded ${editor?.isActive('heading', { level: 2 }) ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}
                title="Heading 2"
              >
                H2
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
                className={`px-2 py-1 rounded ${editor?.isActive('heading', { level: 3 }) ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}
                title="Heading 3"
              >
                H3
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().setParagraph().run()}
                className={`px-2 py-1 rounded ${editor?.isActive('paragraph') ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}
                title="Paragraph"
              >
                P
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleBold().run()}
                className={`px-2 py-1 rounded ${editor?.isActive('bold') ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}
                title="Bold"
              >
                <b>B</b>
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
                className={`px-2 py-1 rounded ${editor?.isActive('codeBlock') ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}
                title="Code Block"
              >
                <code>{'</>'}</code>
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                className={`px-2 py-1 rounded ${editor?.isActive('blockquote') ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}
                title="Blockquote"
              >
                "
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                className={`px-2 py-1 rounded ${editor?.isActive('bulletList') ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}
                title="Bullet List"
              >
                •
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                className={`px-2 py-1 rounded ${editor?.isActive('orderedList') ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}
                title="Ordered List"
              >
                1.
              </button>
              <select
                onChange={(e) => editor?.chain().focus().setColor(e.target.value).run()}
                className="px-2 py-1 rounded bg-white text-black"
                title="Text Color"
              >
                <option value="">Default</option>
                <option value="#000000">Black</option>
                <option value="#ff0000">Red</option>
                <option value="#00ff00">Green</option>
                <option value="#0000ff">Blue</option>
              </select>
              <button
                type="button"
                onClick={() => {
                  const url = prompt('Enter the URL:');
                  if (url) {
                    editor?.chain().focus().setLink({ href: url }).run();
                  }
                }}
                className={`px-2 py-1 rounded ${editor?.isActive('link') ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}
                title="Link"
              >
                Link
              </button>
              <button
                type="button"
                onClick={handleFileUpload}
                className="px-2 py-1 rounded bg-white text-black"
                title="Upload File"
              >
                📎
              </button>
            </div>
            <EditorContent editor={editor} />
            <button
              type="submit"
              disabled={loading}
              className="mt-6 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 disabled:bg-gray-400"
            >
              {loading ? 'Publishing...' : 'Publish'}
            </button>
          </form>
          <ToastContainer position="top-right" autoClose={3000} />
        </div>
      </div>
      <Footer />

      <Modal
        isOpen={isImageModalOpen}
        onRequestClose={() => {
          setIsImageModalOpen(false);
          setSelectedImage(null);
          setCroppedAreaPixels(null);
          setCrop({ x: 0, y: 0 });
          setZoom(1);
          setResizeWidth(800);
        }}
        style={{
          content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            maxWidth: '600px',
            padding: '20px',
            borderRadius: '8px',
          },
        }}
      >
        <h2 className="text-xl font-bold mb-4">Edit Image</h2>
        {selectedImage && (
          <div className="relative h-64 mb-4">
            <TransformWrapper initialScale={1} onZoom={(state) => setZoom(state.state.scale)}>
              <TransformComponent>
                <Cropper
                  image={selectedImage}
                  crop={crop}
                  zoom={zoom}
                  aspect={4 / 3}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </TransformComponent>
            </TransformWrapper>
          </div>
        )}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Resize Width (px):</label>
          <input
            type="number"
            value={resizeWidth}
            onChange={(e) => setResizeWidth(Number(e.target.value))}
            min="100"
            max="2000"
            className="mt-1 block w-full border rounded p-2"
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => {
              setIsImageModalOpen(false);
              setSelectedImage(null);
              setCroppedAreaPixels(null);
              setCrop({ x: 0, y: 0 });
              setZoom(1);
              setResizeWidth(800);
            }}
            className="px-4 py-2 bg-gray-200 text-black rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleImageProcess}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? 'Processing...' : 'Apply and Upload'}
          </button>
        </div>
      </Modal>
    </div>
  );
}