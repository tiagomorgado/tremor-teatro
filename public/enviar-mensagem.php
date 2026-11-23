<?php
/**
 * Contact form → email, through the hosting's own mail system (what WordPress did before).
 *
 * The browser checks in app/lib/contact.ts can be bypassed by anyone, so every rule is
 * enforced again here: only POSTs from our own pages, a hidden spam trap, a minimum fill
 * time, strict field validation, nothing from the visitor ever reaches an email header
 * except a validated address, and a rate limit per visitor and per hour overall.
 *
 * Settings: the three constants below. SUBJECTS must match `subjects` in app/routes/contacto.tsx.
 */

const TO = 'geral@tremorteatro.pt';      // where messages arrive
const FROM = 'geral@tremorteatro.pt';    // must be an address of this domain (SPF/DKIM)
const SITE = 'https://tremorteatro.pt';

const SUBJECTS = ['Programação e digressão', 'Coprodução', 'Imprensa', 'Formação', 'Outro assunto'];
const MIN_FILL_MS = 3000;
const PER_VISITOR = 3;          // messages per visitor…
const PER_VISITOR_WINDOW = 600; // …per 10 minutes
const PER_HOUR_TOTAL = 30;      // all visitors together: caps any flood
const MAX_BODY_BYTES = 16384;

ini_set('display_errors', '0');
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function reply(int $status, array $data): never
{
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

/** Control, zero-width and bidi-override characters out; one line unless $multiline. */
function clean(mixed $value, int $max, bool $multiline = false): string
{
    $s = is_string($value) ? $value : '';
    if (!mb_check_encoding($s, 'UTF-8')) return '';
    $s = preg_replace('/[\x{0000}-\x{0008}\x{000B}\x{000C}\x{000E}-\x{001F}\x{007F}\x{200B}-\x{200F}\x{202A}-\x{202E}\x{2066}-\x{2069}]/u', '', $s);
    if ($multiline) {
        $s = preg_replace("/\r\n?/", "\n", $s);
        $s = preg_replace("/\n{4,}/", "\n\n\n", $s);
    } else {
        $s = preg_replace('/\s+/u', ' ', $s);
    }
    return mb_substr(trim($s), 0, $max);
}

// 1. Only POSTed JSON, of a sane size, sent by our own pages.
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    reply(405, ['ok' => false]);
}
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin === '') {
    $ref = parse_url($_SERVER['HTTP_REFERER'] ?? '');
    $origin = isset($ref['scheme'], $ref['host']) ? $ref['scheme'] . '://' . $ref['host'] : '';
}
$sameHost = 'https://' . ($_SERVER['HTTP_HOST'] ?? '');
if ($origin !== SITE && $origin !== $sameHost) reply(403, ['ok' => false]);
if (stripos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') !== 0) reply(415, ['ok' => false]);
$raw = file_get_contents('php://input', false, null, 0, MAX_BODY_BYTES + 1);
if ($raw === false || strlen($raw) > MAX_BODY_BYTES) reply(413, ['ok' => false]);
$in = json_decode($raw, true);
if (!is_array($in)) reply(400, ['ok' => false]);

// 2. Bots: answer "sent" so they learn nothing, and send nothing.
$elapsed = filter_var($in['t'] ?? null, FILTER_VALIDATE_INT);
if (!empty($in['_gotcha']) || $elapsed === false || $elapsed < MIN_FILL_MS) reply(200, ['ok' => true]);

// 3. The same rules as the form, enforced for real.
$nome = clean($in['nome'] ?? '', 100);
$email = clean($in['email'] ?? '', 254);
$assunto = clean($in['assunto'] ?? '', 60);
$criacao = clean($in['criacao'] ?? '', 60);
$mensagem = clean($in['mensagem'] ?? '', 4000, true);

$invalid = mb_strlen($nome) < 2
    || preg_match('/https?:|www\.|[<>]/i', $nome)
    || !filter_var($email, FILTER_VALIDATE_EMAIL)
    || !in_array($assunto, SUBJECTS, true)
    || ($criacao !== '' && !preg_match('/^[\p{L}\p{N} ,.\-–]+$/u', $criacao))
    || mb_strlen($mensagem) < 10
    || preg_match_all('/https?:\/\/|www\./i', $mensagem) > 3;
if ($invalid) reply(422, ['ok' => false]);

// 4. Rate limit. Stored outside the public folder when possible; visitors are kept only as a
//    salted hash of their IP, never the IP itself.
$base = dirname($_SERVER['DOCUMENT_ROOT'] ?? __DIR__);
$dir = is_writable($base) ? $base . '/.tremor-contact' : sys_get_temp_dir() . '/tremor-contact';
if (!is_dir($dir)) @mkdir($dir, 0700, true);
$file = $dir . '/limits.json';
$fh = @fopen($file, 'c+');
if (!$fh || !flock($fh, LOCK_EX)) reply(503, ['ok' => false]);
$now = time();
$log = json_decode(stream_get_contents($fh) ?: '{}', true) ?: [];
$visitor = hash('sha256', __FILE__ . ($_SERVER['REMOTE_ADDR'] ?? ''));
foreach ($log as $k => $times) {
    $log[$k] = array_values(array_filter($times, fn ($t) => $t > $now - 3600));
    if (!$log[$k]) unset($log[$k]);
}
$mine = array_filter($log[$visitor] ?? [], fn ($t) => $t > $now - PER_VISITOR_WINDOW);
$total = array_sum(array_map('count', $log));
if (count($mine) >= PER_VISITOR || $total >= PER_HOUR_TOTAL) {
    flock($fh, LOCK_UN);
    fclose($fh);
    reply(429, ['ok' => false]);
}
$log[$visitor][] = $now;
ftruncate($fh, 0);
rewind($fh);
fwrite($fh, json_encode($log));
fflush($fh);
flock($fh, LOCK_UN);
fclose($fh);

// 5. Send. Headers are built only from our constants and the validated address; the
//    visitor's text goes in the body, encoded, where it cannot become a header.
$subject = '[Site] ' . $assunto . ($criacao !== '' ? ': ' . $criacao : '');
$body = "Nome: $nome\nEmail: $email\nAssunto: $assunto\n"
    . ($criacao !== '' ? "Criação: $criacao\n" : '')
    . "\n$mensagem\n\n--\nEnviado pelo formulário de contacto de " . SITE . "\n";
$headers = [
    'From' => 'Site Tremor Teatro <' . FROM . '>',
    'Reply-To' => $email,
    'MIME-Version' => '1.0',
    'Content-Type' => 'text/plain; charset=UTF-8',
    'Content-Transfer-Encoding' => 'base64',
    'X-Mailer' => 'tremorteatro.pt',
];
$sent = mail(
    TO,
    mb_encode_mimeheader($subject, 'UTF-8', 'B', "\r\n"),
    chunk_split(base64_encode(str_replace("\n", "\r\n", $body))),
    $headers,
    '-f' . FROM
);
reply($sent ? 200 : 502, ['ok' => $sent]);
