import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "@/config";
import { onAuthStateChanged } from "firebase/auth";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BrowserWallet } from "@meshsdk/core";

export default function FinalizeQuestPage() {
  const router = useRouter();
  const { id: questId } = router.query;
  const [loading, setLoading] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [quest, setQuest] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [wallet, setWallet] = useState<BrowserWallet | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (questId && authReady) {
      const fetchQuest = async () => {
        try {
          const questRef = doc(db, "quests", questId as string);
          const questSnap = await getDoc(questRef);
          if (questSnap.exists()) {
            setQuest(questSnap.data());
          } else {
            setError("Quest not found");
          }
        } catch (err: any) {
          setError(err.message);
        }
      };
      fetchQuest();
    }
  }, [questId, authReady]);

  const handleConnectWallet = async () => {
    try {
      const connectedWallet = await BrowserWallet.enable("eternl"); 
      setWallet(connectedWallet);
      toast.success("Wallet connected");
    } catch (err: any) {
      toast.error(`Wallet connection failed: ${err.message}`);
    }
  };

  const handleFinalize = async () => {
    if (!user) {
      toast.error("Please sign in to finalize the quest");
      return;
    }
    if (!questId) {
      toast.error("Quest ID not found");
      return;
    }
    if (!wallet) {
      toast.error("Please connect a wallet");
      return;
    }

    setLoading(true);
    try {
      // Fetch unsigned transactions
      const response = await fetch("/api/finalize-quest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questId, userId: user.uid }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error);
      }

      // Sign each transaction
      const { unsignedTxs } = result;
      const signedTxs: string[] = [];
      for (const unsignedTx of unsignedTxs) {
        const signedTx = await wallet.signTx(unsignedTx);
        signedTxs.push(signedTx);
      }

      // Submit signed transactions
      for (const [index, signedTx] of signedTxs.entries()) {
        const submitResponse = await fetch("/api/add-eligible", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            questId,
            address: result.allocations?.[index]?.address || "unknown",
            amount: result.allocations?.[index]?.amount || 0,
            signedTx,
          }),
        });
        const submitResult = await submitResponse.json();
        if (!submitResponse.ok) {
          throw new Error(`Failed to submit transaction ${index + 1}: ${submitResult.error}`);
        }
      }

      toast.success(result.message);
      router.push(`/quests/${questId}`);
    } catch (error: any) {
      toast.error(`Failed to finalize quest: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!authReady || !quest) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center mt-20">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center mt-20 text-red-600">{error}</div>
      </div>
    );
  }

  const endDate = new Date(quest.endDate);
  const isEnded = new Date() >= endDate;
  const isCreator = user && quest.creatorUid === user.uid;
  const isAlreadyFinalized = quest.status === "ended";

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="bg-white w-full max-w-md shadow-2xl p-8 rounded-lg">
        <h1 className="text-2xl font-bold mb-4">Finalize Quest: {quest.name}</h1>
        {isAlreadyFinalized ? (
          <p className="text-green-600">This quest has already been finalized.</p>
        ) : !isCreator ? (
          <p className="text-red-600">Only the quest creator can finalize this quest.</p>
        ) : !isEnded ? (
          <p className="text-yellow-600">
            Quest has not ended yet. End date: {endDate.toLocaleDateString()}
          </p>
        ) : (
          <>
            <p className="mb-4">
              Finalize the quest to allocate rewards based on user progress. This will require signing
              transactions with your wallet.
            </p>
            {!wallet && (
              <button
                className="btn w-full bg-blue-600 text-white hover:bg-blue-700 mb-4"
                onClick={handleConnectWallet}
              >
                Connect Wallet
              </button>
            )}
            <button
              className="btn w-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              onClick={handleFinalize}
              disabled={loading || !wallet}
            >
              {loading ? "Finalizing..." : "Finalize Quest"}
            </button>
          </>
        )}
        <ToastContainer position="bottom-right" autoClose={3000} />
      </div>
    </div>
  );
}