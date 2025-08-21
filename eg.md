Bun 提供了快速的原生绑定，用于与 S3 兼容的对象存储服务进行交互。Bun 的 S3 API 设计得简单易用，感觉类似于 fetch 的 Response 和 Blob API（就像 Bun 的本地文件系统 API 一样）。

import { s3, write, S3Client } from "bun";

// Bun.s3 reads environment variables for credentials
// file() returns a lazy reference to a file on S3
const metadata = s3.file("123.json");

// Download from S3 as JSON
const data = await metadata.json();

// Upload to S3
await write(metadata, JSON.stringify({ name: "John", age: 30 }));

// Presign a URL (synchronous - no network request needed)
const url = metadata.presign({
  acl: "public-read",
  expiresIn: 60 * 60 * 24, // 1 day
});

// Delete the file
await metadata.delete();
S3 是 事实上的标准 互联网文件系统。Bun 的 S3 API 可以与 S3 兼容的存储服务一起使用，例如

AWS S3
Cloudflare R2
DigitalOcean Spaces
MinIO
Backblaze B2
...以及任何其他 S3 兼容的存储服务
基本用法
有几种方法可以与 Bun 的 S3 API 交互。

Bun.S3Client & Bun.s3
Bun.s3 等同于 new Bun.S3Client()，依赖于环境变量获取凭证。

要显式设置凭证，请将它们传递给 Bun.S3Client 构造函数。

import { S3Client } from "bun";

const client = new S3Client({
  accessKeyId: "your-access-key",
  secretAccessKey: "your-secret-key",
  bucket: "my-bucket",
  // sessionToken: "..."
  // acl: "public-read",
  // endpoint: "https://s3.us-east-1.amazonaws.com",
  // endpoint: "https://<account-id>.r2.cloudflarestorage.com", // Cloudflare R2
  // endpoint: "https://<region>.digitaloceanspaces.com", // DigitalOcean Spaces
  // endpoint: "http://localhost:9000", // MinIO
});

// Bun.s3 is a global singleton that is equivalent to `new Bun.S3Client()`
使用 S3 文件
S3Client 中的 file 方法返回 S3 上文件的惰性引用。

// A lazy reference to a file on S3
const s3file: S3File = client.file("123.json");
与 Bun.file(path) 类似，S3Client 的 file 方法是同步的。在您调用依赖于网络请求的方法之前，它不会执行任何网络请求。

从 S3 读取文件
如果您使用过 fetch API，您会熟悉 Response 和 Blob API。S3File 扩展了 Blob。在 Blob 上工作的方法也适用于 S3File。

// Read an S3File as text
const text = await s3file.text();

// Read an S3File as JSON
const json = await s3file.json();

// Read an S3File as an ArrayBuffer
const buffer = await s3file.arrayBuffer();

// Get only the first 1024 bytes
const partial = await s3file.slice(0, 1024).text();

// Stream the file
const stream = s3file.stream();
for await (const chunk of stream) {
  console.log(chunk);
}
内存优化
诸如 text()、json()、bytes() 或 arrayBuffer() 等方法在可能的情况下避免在内存中复制字符串或字节。

如果文本恰好是 ASCII，Bun 会直接将字符串传输到 JavaScriptCore（引擎），而无需转码，也无需在内存中复制字符串。当您使用 .bytes() 或 .arrayBuffer() 时，它也会避免在内存中复制字节。

这些辅助方法不仅简化了 API，还使其更快。

写入 & 上传文件到 S3
写入 S3 同样简单。

// Write a string (replacing the file)
await s3file.write("Hello World!");

// Write a Buffer (replacing the file)
await s3file.write(Buffer.from("Hello World!"));

// Write a Response (replacing the file)
await s3file.write(new Response("Hello World!"));

// Write with content type
await s3file.write(JSON.stringify({ name: "John", age: 30 }), {
  type: "application/json",
});

// Write using a writer (streaming)
const writer = s3file.writer({ type: "application/json" });
writer.write("Hello");
writer.write(" World!");
await writer.end();

// Write using Bun.write
await Bun.write(s3file, "Hello World!");
使用大型文件（流）
Bun 自动处理大型文件的多部分上传，并提供流式处理功能。适用于本地文件的 API 也适用于 S3 文件。

// Write a large file
const bigFile = Buffer.alloc(10 * 1024 * 1024); // 10MB
const writer = s3file.writer({
  // Automatically retry on network errors up to 3 times
  retry: 3,

  // Queue up to 10 requests at a time
  queueSize: 10,

  // Upload in 5 MB chunks
  partSize: 5 * 1024 * 1024,
});
for (let i = 0; i < 10; i++) {
  await writer.write(bigFile);
}
await writer.end();
预签名 URL
当您的生产服务需要让用户将文件上传到您的服务器时，通常用户直接上传到 S3 比您的服务器充当中间人更可靠。

为了方便这一点，您可以为 S3 文件预签名 URL。这将生成一个带有签名的 URL，允许用户安全地将该特定文件上传到 S3，而无需暴露您的凭证或授予他们不必要的访问您存储桶的权限。

默认行为是生成一个 GET URL，该 URL 在 24 小时后过期。Bun 尝试从文件扩展名推断内容类型。如果无法推断，则默认使用 application/octet-stream。

import { s3 } from "bun";

// Generate a presigned URL that expires in 24 hours (default)
const download = s3.presign("my-file.txt"); // GET, text/plain, expires in 24 hours

const upload = s3.presign("my-file", {
  expiresIn: 3600, // 1 hour
  method: "PUT",
  type: "application/json", // No extension for inferring, so we can specify the content type to be JSON
});

// You can call .presign() if on a file reference, but avoid doing so
// unless you already have a reference (to avoid memory usage).
const myFile = s3.file("my-file.txt");
const presignedFile = myFile.presign({
  expiresIn: 3600, // 1 hour
});
设置 ACL
要在预签名 URL 上设置 ACL（访问控制列表），请传递 acl 选项

const url = s3file.presign({
  acl: "public-read",
  expiresIn: 3600,
});
您可以传递以下任何 ACL

ACL	说明
"public-read"	对象可由公众读取。
"private"	对象只能由存储桶所有者读取。
"public-read-write"	对象可由公众读取和写入。
"authenticated-read"	对象可由存储桶所有者和经过身份验证的用户读取。
"aws-exec-read"	对象可由发出请求的 AWS 账户读取。
"bucket-owner-read"	对象可由存储桶所有者读取。
"bucket-owner-full-control"	对象可由存储桶所有者读取和写入。
"log-delivery-write"	对象可由用于日志交付的 AWS 服务写入。
过期 URL
要为预签名 URL 设置过期时间，请传递 expiresIn 选项。

const url = s3file.presign({
  // Seconds
  expiresIn: 3600, // 1 hour

  // access control list
  acl: "public-read",

  // HTTP method
  method: "PUT",
});
method
要为预签名 URL 设置 HTTP 方法，请传递 method 选项。

const url = s3file.presign({
  method: "PUT",
  // method: "DELETE",
  // method: "GET",
  // method: "HEAD",
  // method: "POST",
  // method: "PUT",
});
new Response(S3File)
要快速将用户重定向到 S3 文件的预签名 URL，请将 S3File 实例作为主体传递给 Response 对象。

const response = new Response(s3file);
console.log(response);
这将自动将用户重定向到 S3 文件的预签名 URL，从而节省您将文件下载到服务器并将其发回给用户的内存、时间和带宽成本。

Response (0 KB) {
  ok: false,
  url: "",
  status: 302,
  statusText: "",
  headers: Headers {
    "location": "https://<account-id>.r2.cloudflarestorage.com/...",
  },
  redirected: true,
  bodyUsed: false
}
支持 S3 兼容服务
Bun 的 S3 实现适用于任何 S3 兼容的存储服务。只需指定适当的端点

将 Bun 的 S3Client 与 AWS S3 结合使用
AWS S3 是默认设置。您也可以传递 region 选项而不是 endpoint 选项用于 AWS S3。

import { S3Client } from "bun";

// AWS S3
const s3 = new S3Client({
  accessKeyId: "access-key",
  secretAccessKey: "secret-key",
  bucket: "my-bucket",
  // endpoint: "https://s3.us-east-1.amazonaws.com",
  // region: "us-east-1",
});
将 Bun 的 S3Client 与 Google Cloud Storage 结合使用
要将 Bun 的 S3 客户端与 Google Cloud Storage 结合使用，请在 S3Client 构造函数中将 endpoint 设置为 "https://storage.googleapis.com"。

import { S3Client } from "bun";

// Google Cloud Storage
const gcs = new S3Client({
  accessKeyId: "access-key",
  secretAccessKey: "secret-key",
  bucket: "my-bucket",
  endpoint: "https://storage.googleapis.com",
});
将 Bun 的 S3Client 与 Cloudflare R2 结合使用
要将 Bun 的 S3 客户端与 Cloudflare R2 结合使用，请在 S3Client 构造函数中将 endpoint 设置为 R2 端点。R2 端点包括您的账户 ID。

import { S3Client } from "bun";

// CloudFlare R2
const r2 = new S3Client({
  accessKeyId: "access-key",
  secretAccessKey: "secret-key",
  bucket: "my-bucket",
  endpoint: "https://<account-id>.r2.cloudflarestorage.com",
});
将 Bun 的 S3Client 与 DigitalOcean Spaces 结合使用
要将 Bun 的 S3 客户端与 DigitalOcean Spaces 结合使用，请在 S3Client 构造函数中将 endpoint 设置为 DigitalOcean Spaces 端点。

import { S3Client } from "bun";

const spaces = new S3Client({
  accessKeyId: "access-key",
  secretAccessKey: "secret-key",
  bucket: "my-bucket",
  // region: "nyc3",
  endpoint: "https://<region>.digitaloceanspaces.com",
});
将 Bun 的 S3Client 与 MinIO 结合使用
要将 Bun 的 S3 客户端与 MinIO 结合使用，请在 S3Client 构造函数中将 endpoint 设置为 MinIO 正在运行的 URL。

import { S3Client } from "bun";

const minio = new S3Client({
  accessKeyId: "access-key",
  secretAccessKey: "secret-key",
  bucket: "my-bucket",

  // Make sure to use the correct endpoint URL
  // It might not be localhost in production!
  endpoint: "http://localhost:9000",
});
将 Bun 的 S3Client 与 supabase 结合使用
要将 Bun 的 S3 客户端与 supabase 结合使用，请在 S3Client 构造函数中将 endpoint 设置为 supabase 端点。supabase 端点包括您的账户 ID 和 /storage/v1/s3 路径。请务必在 supabase 仪表板 https://supabase.com/dashboard/project/<account-id>/settings/storage 中设置“Enable connection via S3 protocol”，并设置在同一部分中告知的区域。

import { S3Client } from "bun";

const supabase = new S3Client({
  accessKeyId: "access-key",
  secretAccessKey: "secret-key",
  bucket: "my-bucket",
  region: "us-west-1",
  endpoint: "https://<account-id>.supabase.co/storage/v1/s3/storage",
});
将 Bun 的 S3Client 与 S3 虚拟主机风格端点结合使用
当使用 S3 虚拟主机风格端点时，您需要将 virtualHostedStyle 选项设置为 true，如果未提供端点，Bun 将使用区域和存储桶来推断到 AWS S3 的端点，如果未提供区域，则将使用 us-east-1。如果您提供了端点，则无需提供存储桶名称。

import { S3Client } from "bun";

// AWS S3 endpoint inferred from region and bucket
const s3 = new S3Client({
  accessKeyId: "access-key",
  secretAccessKey: "secret-key",
  bucket: "my-bucket",
  virtualHostedStyle: true,
  // endpoint: "https://my-bucket.s3.us-east-1.amazonaws.com",
  // region: "us-east-1",
});

// AWS S3
const s3WithEndpoint = new S3Client({
  accessKeyId: "access-key",
  secretAccessKey: "secret-key",
  endpoint: "https://<bucket-name>.s3.<region>.amazonaws.com",
  virtualHostedStyle: true,
});

// Cloudflare R2
const r2WithEndpoint = new S3Client({
  accessKeyId: "access-key",
  secretAccessKey: "secret-key",
  endpoint: "https://<bucket-name>.<account-id>.r2.cloudflarestorage.com",
  virtualHostedStyle: true,
});
凭证
凭证是使用 S3 最困难的部分之一，我们已尽力使其尽可能容易。默认情况下，Bun 读取以下环境变量以获取凭证。

选项名称	环境变量
accessKeyId	S3_ACCESS_KEY_ID
secretAccessKey	S3_SECRET_ACCESS_KEY
region	S3_REGION
endpoint	S3_ENDPOINT
bucket	S3_BUCKET
sessionToken	S3_SESSION_TOKEN
如果未设置 S3_* 环境变量，Bun 也会检查上述每个选项的 AWS_* 环境变量。

选项名称	备用环境变量
accessKeyId	AWS_ACCESS_KEY_ID
secretAccessKey	AWS_SECRET_ACCESS_KEY
region	AWS_REGION
endpoint	AWS_ENDPOINT
bucket	AWS_BUCKET
sessionToken	AWS_SESSION_TOKEN
这些环境变量从 .env 文件 或初始化时的进程环境读取（process.env 不用于此）。

这些默认值会被您传递给 s3.file(credentials)、new Bun.S3Client(credentials) 或任何接受凭证的方法的选项覆盖。因此，例如，如果您对不同的存储桶使用相同的凭证，您可以将凭证在 .env 文件中设置一次，然后将 bucket: "my-bucket" 传递给 s3.file() 函数，而无需再次指定所有凭证。

S3Client 对象
当您不使用环境变量或使用多个存储桶时，您可以创建一个 S3Client 对象来显式设置凭证。

import { S3Client } from "bun";

const client = new S3Client({
  accessKeyId: "your-access-key",
  secretAccessKey: "your-secret-key",
  bucket: "my-bucket",
  // sessionToken: "..."
  endpoint: "https://s3.us-east-1.amazonaws.com",
  // endpoint: "https://<account-id>.r2.cloudflarestorage.com", // Cloudflare R2
  // endpoint: "http://localhost:9000", // MinIO
});

// Write using a Response
await file.write(new Response("Hello World!"));

// Presign a URL
const url = file.presign({
  expiresIn: 60 * 60 * 24, // 1 day
  acl: "public-read",
});

// Delete the file
await file.delete();
S3Client.prototype.write
要上传或写入文件到 S3，请在 S3Client 实例上调用 write 方法。

const client = new Bun.S3Client({
  accessKeyId: "your-access-key",
  secretAccessKey: "your-secret-key",
  endpoint: "https://s3.us-east-1.amazonaws.com",
  bucket: "my-bucket",
});
await client.write("my-file.txt", "Hello World!");
await client.write("my-file.txt", new Response("Hello World!"));

// equivalent to
// await client.file("my-file.txt").write("Hello World!");
S3Client.prototype.delete
要从 S3 删除文件，请在 S3Client 实例上调用 delete 方法。

const client = new Bun.S3Client({
  accessKeyId: "your-access-key",
  secretAccessKey: "your-secret-key",
  bucket: "my-bucket",
});

await client.delete("my-file.txt");
// equivalent to
// await client.file("my-file.txt").delete();
S3Client.prototype.exists
要检查文件是否在 S3 中存在，请在 S3Client 实例上调用 exists 方法。

const client = new Bun.S3Client({
  accessKeyId: "your-access-key",
  secretAccessKey: "your-secret-key",
  bucket: "my-bucket",
});

const exists = await client.exists("my-file.txt");
// equivalent to
// const exists = await client.file("my-file.txt").exists();
S3File
S3File 实例通过调用 S3Client 实例方法或 s3.file() 函数创建。与 Bun.file() 类似，S3File 实例是惰性的。它们并不一定在创建时就指向实际存在的东西。这就是为什么所有不涉及网络请求的方法都是完全同步的。

interface S3File extends Blob {
  slice(start: number, end?: number): S3File;
  exists(): Promise<boolean>;
  unlink(): Promise<void>;
  presign(options: S3Options): string;
  text(): Promise<string>;
  json(): Promise<any>;
  bytes(): Promise<Uint8Array>;
  arrayBuffer(): Promise<ArrayBuffer>;
  stream(options: S3Options): ReadableStream;
  write(
    data:
      | string
      | Uint8Array
      | ArrayBuffer
      | Blob
      | ReadableStream
      | Response
      | Request,
    options?: BlobPropertyBag,
  ): Promise<number>;

  exists(options?: S3Options): Promise<boolean>;
  unlink(options?: S3Options): Promise<void>;
  delete(options?: S3Options): Promise<void>;
  presign(options?: S3Options): string;

  stat(options?: S3Options): Promise<S3Stat>;
  /**
   * Size is not synchronously available because it requires a network request.
   *
   * @deprecated Use `stat()` instead.
   */
  size: NaN;

  // ... more omitted for brevity
}
与 Bun.file() 类似，S3File 扩展了 Blob，因此 Blob 上可用的所有方法也都在 S3File 上可用。用于从本地文件读取数据的相同 API 也可用于从 S3 读取数据。

方法	输出
await s3File.text()	string
await s3File.bytes()	Uint8Array
await s3File.json()	JSON
await s3File.stream()	ReadableStream
await s3File.arrayBuffer()	ArrayBuffer
这意味着将 S3File 实例与 fetch()、Response 和其他接受 Blob 实例的 Web API 一起使用，可以直接工作。

使用 slice 进行部分读取
要读取文件的部分范围，您可以使用 slice 方法。

const partial = s3file.slice(0, 1024);

// Read the partial range as a Uint8Array
const bytes = await partial.bytes();

// Read the partial range as a string
const text = await partial.text();
在内部，这通过使用 HTTP Range 标头来仅请求您想要的字节来实现。此 slice 方法与 Blob.prototype.slice 相同。

从 S3 删除文件
要从 S3 删除文件，您可以使用 delete 方法。

await s3file.delete();
// await s3File.unlink();
delete 与 unlink 相同。

错误代码
当 Bun 的 S3 API 抛出错误时，它将具有一个 code 属性，该属性与以下值之一匹配

ERR_S3_MISSING_CREDENTIALS
ERR_S3_INVALID_METHOD
ERR_S3_INVALID_PATH
ERR_S3_INVALID_ENDPOINT
ERR_S3_INVALID_SIGNATURE
ERR_S3_INVALID_SESSION_TOKEN
当 S3 对象存储服务返回错误时（即，不是 Bun 的错误），它将是一个 S3Error 实例（一个名称为 "S3Error" 的 Error 实例）。

S3Client 静态方法
S3Client 类提供了几个用于与 S3 交互的静态方法。

S3Client.presign（静态方法）
要为 S3 文件生成预签名 URL，您可以使用 S3Client.presign 静态方法。

import { S3Client } from "bun";

const credentials = {
  accessKeyId: "your-access-key",
  secretAccessKey: "your-secret-key",
  bucket: "my-bucket",
  // endpoint: "https://s3.us-east-1.amazonaws.com",
  // endpoint: "https://<account-id>.r2.cloudflarestorage.com", // Cloudflare R2
};

const url = S3Client.presign("my-file.txt", {
  ...credentials,
  expiresIn: 3600,
});
这等效于调用 new S3Client(credentials).presign("my-file.txt", { expiresIn: 3600 })。

S3Client.exists（静态方法）
要检查 S3 文件是否存在，您可以使用 S3Client.exists 静态方法。

import { S3Client } from "bun";

const credentials = {
  accessKeyId: "your-access-key",
  secretAccessKey: "your-secret-key",
  bucket: "my-bucket",
  // endpoint: "https://s3.us-east-1.amazonaws.com",
};

const exists = await S3Client.exists("my-file.txt", credentials);
相同的方法也适用于 S3File 实例。

import { s3 } from "bun";

const s3file = s3.file("my-file.txt", {
  ...credentials,
});
const exists = await s3file.exists();
S3Client.stat（静态方法）
要获取 S3 文件的大小、etag 和其他元数据，您可以使用 S3Client.stat 静态方法。

import { S3Client } from "bun";

const credentials = {
  accessKeyId: "your-access-key",
  secretAccessKey: "your-secret-key",
  bucket: "my-bucket",
  // endpoint: "https://s3.us-east-1.amazonaws.com",
};

const stat = await S3Client.stat("my-file.txt", credentials);
// {
//   etag: "\"7a30b741503c0b461cc14157e2df4ad8\"",
//   lastModified: 2025-01-07T00:19:10.000Z,
//   size: 1024,
//   type: "text/plain;charset=utf-8",
// }
S3Client.delete（静态方法）
要删除 S3 文件，您可以使用 S3Client.delete 静态方法。

import { S3Client } from "bun";

const credentials = {
  accessKeyId: "your-access-key",
  secretAccessKey: "your-secret-key",
  bucket: "my-bucket",
  // endpoint: "https://s3.us-east-1.amazonaws.com",
};

await S3Client.delete("my-file.txt", credentials);
// equivalent to
// await new S3Client(credentials).delete("my-file.txt");

// S3Client.unlink is alias of S3Client.delete
await S3Client.unlink("my-file.txt", credentials);
s3:// 协议
为了更轻松地将相同的代码用于本地文件和 S3 文件，fetch 和 Bun.file() 中支持 s3:// 协议。

const response = await fetch("s3://my-bucket/my-file.txt");
const file = Bun.file("s3://my-bucket/my-file.txt");
您可以另外将 s3 选项传递给 fetch 和 Bun.file 函数。

const response = await fetch("s3://my-bucket/my-file.txt", {
  s3: {
    accessKeyId: "your-access-key",
    secretAccessKey: "your-secret-key",
    endpoint: "https://s3.us-east-1.amazonaws.com",
  },
  headers: {
    "range": "bytes=0-1023",
  },
});
UTF-8、UTF-16 和 BOM（字节顺序标记）
与 Response 和 Blob 类似，S3File 默认采用 UTF-8 编码。

当在 S3File 上调用 text() 或 json() 方法之一时

当检测到 UTF-16 字节顺序标记 (BOM) 时，它将被视为 UTF-16。JavaScriptCore 原生支持 UTF-16，因此它会跳过 UTF-8 转码过程（并剥离 BOM）。这在大多数情况下是好的，但这也意味着如果您的 UTF-16 字符串中存在无效的代理对字符，它们将被传递到 JavaScriptCore（与源代码相同）。
当检测到 UTF-8 BOM 时，它会在字符串传递到 JavaScriptCore 之前被剥离，并且无效的 UTF-8 代码点将被替换为 Unicode 替换字符 (\uFFFD)。
不支持 UTF-32。