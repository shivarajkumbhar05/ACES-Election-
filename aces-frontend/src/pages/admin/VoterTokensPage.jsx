import { useEffect, useState } from "react";
import { Ticket, Copy, Check, Loader2, Download, Ban, QrCode } from "lucide-react";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Alert from "../../components/Alert";
import Modal from "../../components/Modal";
import { getCurrentElection } from "../../api/election";
import {
  generateTokens,
  listTokens,
  revokeToken,
  exportUnusedTokensUrl,
  generateTokenQr,
} from "../../api/admin";

export default function VoterTokensPage() {
  const [election, setElection] = useState(null);
  const [tokens, setTokens] = useState([]);
  const [stats, setStats] = useState({ total: 0, used: 0, active: 0, revoked: 0 });
  const [count, setCount] = useState(50);
  const [generating, setGenerating] = useState(false);
  const [freshTokens, setFreshTokens] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [copiedAll, setCopiedAll] = useState(false);
  const [qr, setQr] = useState(null);

  async function refresh(electionId) {
    const data = await listTokens(electionId ? { electionId } : {});
    setTokens(data.tokens);
    setStats({ total: data.total, used: data.used, active: data.active, revoked: data.revoked });
  }

  useEffect(() => {
    (async () => {
      try {
        const el = await getCurrentElection();
        setElection(el);
        await refresh(el.id);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleGenerate() {
    if (!election) return;
    setGenerating(true);
    setError("");
    try {
      const result = await generateTokens(election.id, Number(count));
      setFreshTokens(result.tokens);
      await refresh(election.id);
    } catch (e) {
      setError(e.message);
    } finally {
      setGenerating(false);
    }
  }

  async function handleRevoke(tokenId) {
    if (!window.confirm("Revoke this token? It can no longer be used to vote.")) return;
    try {
      await revokeToken(tokenId);
      await refresh(election?.id);
    } catch (e) {
      setError(e.message);
    }
  }

  function copyAllTokens() {
    navigator.clipboard.writeText(freshTokens.join("\n"));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 1500);
  }

  async function handleShowQr(token) {
    try {
      const { qrCode } = await generateTokenQr(token);
      setQr({ token, qrCode });
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-aces-purple-900">Voter Tokens</h1>
        <p className="text-sm text-aces-purple-500">Generate one-time tokens and track distribution.</p>
      </div>

      {error && <Alert type="error">{error}</Alert>}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total", value: stats.total },
          { label: "Active (unused)", value: stats.active },
          { label: "Used", value: stats.used },
          { label: "Revoked", value: stats.revoked },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl bg-white p-4 text-center shadow-card">
            <p className="text-xl font-extrabold text-aces-purple-900">{s.value}</p>
            <p className="text-xs text-aces-purple-400">{s.label}</p>
          </div>
        ))}
      </div>

      <Card title="Generate New Tokens">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-aces-purple-600">Number of tokens</span>
            <input
              type="number"
              min={1}
              max={1000}
              value={count}
              onChange={(e) => setCount(e.target.value)}
              className="w-40 rounded-lg border border-aces-purple-200 px-3 py-2 text-sm focus:border-aces-purple-500 focus:outline-none focus:ring-2 focus:ring-aces-purple-100"
            />
          </label>
          <Button onClick={handleGenerate} disabled={generating || !election}>
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ticket className="h-4 w-4" />}
            Generate Tokens
          </Button>
          <a href={election ? exportUnusedTokensUrl(election.id) : "#"} target="_blank" rel="noreferrer">
            <Button variant="outline">
              <Download className="h-4 w-4" /> Export Unused (Audit)
            </Button>
          </a>
        </div>

        {freshTokens.length > 0 && (
          <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-emerald-800">
                {freshTokens.length} tokens generated — copy these now, they won't be shown again.
              </p>
              <Button size="sm" variant="outline" onClick={copyAllTokens}>
                {copiedAll ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedAll ? "Copied" : "Copy All"}
              </Button>
            </div>
            <div className="max-h-40 overflow-y-auto rounded-lg bg-white p-3 font-mono text-xs text-aces-purple-700 thin-scroll">
              {freshTokens.map((t) => (
                <div key={t} className="flex items-center justify-between border-b border-aces-purple-50 py-1 last:border-none">
                  <span>{t}</span>
                  <button onClick={() => handleShowQr(t)} className="text-aces-purple-400 hover:text-aces-purple-700" aria-label="Show QR code">
                    <QrCode className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      <Card title="Token Activity" bodyClassName="p-0">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-aces-purple-500">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading tokens…
          </div>
        ) : tokens.length === 0 ? (
          <p className="p-8 text-center text-sm italic text-aces-purple-300">No tokens generated yet.</p>
        ) : (
          <div className="max-h-96 overflow-y-auto thin-scroll">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b border-aces-purple-50 text-xs font-bold uppercase tracking-wide text-aces-purple-400">
                  <th className="px-5 py-3">Token Ref.</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Used At</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {tokens.map((t) => (
                  <tr key={t._id} className="border-b border-aces-purple-50 last:border-none">
                    <td className="px-5 py-3 font-mono text-aces-purple-700">****-{t.tokenPreview}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          t.status === "ACTIVE"
                            ? "bg-emerald-100 text-emerald-700"
                            : t.status === "USED"
                            ? "bg-aces-purple-100 text-aces-purple-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-aces-purple-500">
                      {t.usedAt ? new Date(t.usedAt).toLocaleString("en-IN") : "—"}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {t.status === "ACTIVE" && (
                        <button
                          onClick={() => handleRevoke(t._id)}
                          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-red-500 hover:bg-red-50"
                        >
                          <Ban className="h-3.5 w-3.5" /> Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {qr && (
        <Modal title="Token QR Code" onClose={() => setQr(null)}>
          <div className="flex flex-col items-center gap-3">
            <img src={qr.qrCode} alt="Voting token QR code" className="h-56 w-56 rounded-lg border border-aces-purple-100" />
            <p className="break-all text-center font-mono text-xs text-aces-purple-500">{qr.token}</p>
          </div>
        </Modal>
      )}
    </div>
  );
}
