// One command to get an installable APK on your own computer:  npm run apk
// Needs: Node 22+, JDK 21 (java on PATH or JAVA_HOME) and Android SDK (ANDROID_HOME or ANDROID_SDK_ROOT).
// Android Studio is NOT required – the SDK command-line tools are enough.
import { execSync } from 'node:child_process';
import { existsSync, copyFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const win = process.platform === 'win32';
const run = (cmd, cwd = root) => { console.log(`\n> ${cmd}`); execSync(cmd, { cwd, stdio: 'inherit', env: { ...process.env, NG_CLI_ANALYTICS: 'false' } }); };
const fail = (msg) => { console.error(`\nBŁĄD: ${msg}\nZobacz README.md → „APK na własnym komputerze”.`); process.exit(1); };

// 1. checks
try { execSync('java -version', { stdio: 'ignore' }); } catch { fail('Nie znaleziono Javy. Zainstaluj JDK 21 (np. winget install Microsoft.OpenJDK.21) i otwórz nowy terminal.'); }
const sdk = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;
if (!sdk || !existsSync(sdk)) fail('Nie ustawiono ANDROID_HOME (folder z Android SDK, np. C:\\Android).');
if (!existsSync(join(sdk, 'platform-tools'))) fail(`W ${sdk} brakuje platform-tools. Uruchom: sdkmanager "platform-tools" i sdkmanager --licenses`);

// 2. web app → Android project → APK
run('npm run build');
if (!existsSync(join(root, 'android'))) run('npx cap add android');
run('npx cap sync android');
run(win ? 'gradlew.bat assembleDebug' : './gradlew assembleDebug', join(root, 'android'));

// 3. copy the result somewhere easy to find
const apk = join(root, 'android', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
if (!existsSync(apk)) fail('Gradle zakończył się bez pliku APK.');
mkdirSync(join(root, 'apk'), { recursive: true });
const target = join(root, 'apk', 'nauka-rozmowa.apk');
copyFileSync(apk, target);
console.log(`\nGotowe! APK: ${target}`);
console.log('Instalacja na telefonie przez kabel (debugowanie USB włączone):  adb install -r apk/nauka-rozmowa.apk');
