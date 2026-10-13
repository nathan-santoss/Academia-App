// Configuro o SQLite do backend para guardar o cache e a fila durante falhas do Neon.
import { Sequelize } from 'sequelize';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const pasta = fileURLToPath(new URL('../../dados/', import.meta.url));
let arquivo = fileURLToPath(new URL('../../dados/contingencia.sqlite', import.meta.url));

// Permito o banco em memória apenas nas verificações executadas nesta sessão.
if (process.env.SQLITE_EM_MEMORIA === 'true' && process.env.NODE_ENV !== 'production') {
    arquivo = ':memory:';
}

export const bancoLocal = new Sequelize({
    dialect: 'sqlite',
    storage: arquivo,
    logging: false,
});

export async function prepararPastaLocal() {
    if (arquivo === ':memory:') {
        return;
    }
    // Restrinjo a pasta ao usuário do servidor nos sistemas que aceitam estas permissões.
    await mkdir(pasta, {
        recursive: true,
        mode: 0o700,
    });
}
