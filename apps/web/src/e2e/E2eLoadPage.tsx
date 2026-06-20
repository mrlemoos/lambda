import { useScriptSession } from '@lambda/shell';
import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { readE2eFixture, listE2eFixtureNames } from './fixtures.js';

export function E2eLoadPage() {
  const { fixtureName } = useParams<{ fixtureName: string }>();
  const { loadScriptFromText } = useScriptSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!fixtureName) {
      navigate('/');
      return;
    }

    const fixture = readE2eFixture(fixtureName);

    if (!fixture) {
      console.error(
        'E2E fixture not found:',
        fixtureName,
        listE2eFixtureNames(),
      );
      navigate('/');
      return;
    }

    loadScriptFromText(fixture, `${fixtureName}.fountain`);
  }, [fixtureName, loadScriptFromText, navigate]);

  return (
    <main className="app-shell welcome">
      <p>Loading fixture…</p>
      <Link to="/">Back to welcome</Link>
    </main>
  );
}
