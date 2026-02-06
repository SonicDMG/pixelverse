'use client';

import React, { useState, useEffect } from 'react';
import { DynamicUIRenderer } from '@/components/DynamicUIRenderer';
import { ExplainOMaticSpec, KnowledgeLevel } from '@/types';

export default function TestExplainOMaticPage() {
  const [selectedTopic, setSelectedTopic] = useState<string>('quantum-entanglement');
  const [queryInput, setQueryInput] = useState<string>('');
  const [isClient, setIsClient] = useState(false);
  const [storageValue, setStorageValue] = useState<string>('');

  // Client-side only effects
  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem('pixelticker_knowledge_level');
    if (saved) {
      setStorageValue(saved);
    } else {
      setStorageValue('Not set');
    }
  }, []);

  // Sample data for different topics at both knowledge levels
  const sampleData: Record<string, Record<KnowledgeLevel, ExplainOMaticSpec>> = {
    'quantum-entanglement': {
      'kid': {
        type: 'explain-o-matic',
        props: {
          topic: 'Quantum Entanglement',
          knowledgeLevel: 'kid',
          explanation: `Imagine you have two magic coins. When you flip one coin and it lands on heads, the other coin - even if it's on the other side of the world - instantly lands on tails! They're connected by invisible magic.

That's kind of like quantum entanglement! Scientists found that tiny particles can be connected like this. When something happens to one particle, the other particle knows about it right away, even if they're super far apart.

It's like having a magical twin - whatever happens to one, the other one feels it too! Scientists think this is really cool and are trying to use it to make super-fast computers and secure messages.`,
          relatedTopics: [
            {
              title: 'Atoms and Particles',
              description: 'The tiny building blocks that make up everything'
            },
            {
              title: 'Quantum Computers',
              description: 'Super powerful computers using quantum magic'
            }
          ],
          citations: [
            {
              source: 'Wikipedia - Quantum Entanglement (Simple English)',
              url: 'https://simple.wikipedia.org/wiki/Quantum_entanglement',
              excerpt: 'Quantum entanglement is when two particles are connected and what happens to one affects the other.'
            }
          ],
          followUpQuestions: [
            'Can we use quantum entanglement to teleport things?',
            'How do scientists make particles entangled?',
            'Is quantum entanglement faster than light?'
          ]
        }
      },
      'layperson': {
        type: 'explain-o-matic',
        props: {
          topic: 'Quantum Entanglement',
          knowledgeLevel: 'layperson',
          explanation: `Quantum entanglement is a phenomenon where two or more particles become correlated in such a way that the quantum state of one particle cannot be described independently of the others, even when separated by large distances. This correlation persists regardless of the distance between the particles.

When particles are entangled, measuring a property (like spin or polarization) of one particle instantaneously affects the corresponding property of its entangled partner. This doesn't violate relativity because no information is transmitted faster than light - the correlation only becomes apparent when the measurement results are compared.

Einstein famously called this "spooky action at a distance" and was skeptical of it, but experiments have repeatedly confirmed that entanglement is real. Today, it's being used to develop quantum computers, quantum cryptography, and quantum communication networks. The phenomenon is described mathematically by quantum mechanics and has been verified through Bell test experiments.`,
          relatedTopics: [
            {
              title: 'Bell\'s Theorem',
              description: 'Mathematical proof that quantum mechanics is fundamentally different from classical physics'
            },
            {
              title: 'Quantum Computing',
              description: 'Using entanglement for computational advantage'
            },
            {
              title: 'Quantum Cryptography',
              description: 'Secure communication using quantum properties'
            },
            {
              title: 'EPR Paradox',
              description: 'Einstein\'s thought experiment about quantum mechanics'
            }
          ],
          citations: [
            {
              source: 'Wikipedia - Quantum Entanglement',
              url: 'https://en.wikipedia.org/wiki/Quantum_entanglement',
              excerpt: 'Quantum entanglement is a physical phenomenon that occurs when pairs of particles interact in ways such that the quantum state of each particle cannot be described independently.'
            },
            {
              source: 'Wikipedia - Bell\'s Theorem',
              url: 'https://en.wikipedia.org/wiki/Bell%27s_theorem',
              excerpt: 'Bell\'s theorem proves that quantum physics is incompatible with local hidden variable theories.'
            },
            {
              source: 'Wikipedia - EPR Paradox',
              url: 'https://en.wikipedia.org/wiki/EPR_paradox',
              excerpt: 'The EPR paradox is a thought experiment that challenged the completeness of quantum mechanics.'
            }
          ],
          followUpQuestions: [
            'How does quantum entanglement enable quantum computing?',
            'Can entanglement be used for faster-than-light communication?',
            'What are Bell test experiments and why are they important?',
            'How is entanglement used in quantum cryptography?',
            'What is quantum teleportation and how does it work?'
          ]
        }
      }
    },
    'black-holes': {
      'kid': {
        type: 'explain-o-matic',
        props: {
          topic: 'Black Holes',
          knowledgeLevel: 'kid',
          explanation: `A black hole is like a super strong space vacuum cleaner! It's so strong that it sucks up everything around it - even light can't escape once it gets too close.

Black holes form when really big stars die and collapse. Imagine squishing a whole star into a tiny space - that creates such strong gravity that nothing can get away from it. The edge of a black hole is called the "event horizon" - once something crosses that line, it's gone forever!

Even though we can't see black holes (because they're black!), scientists can find them by watching how they pull on stars and gas around them. Some black holes are small, but others are HUGE - millions of times bigger than our Sun!`,
          relatedTopics: [
            {
              title: 'Gravity',
              description: 'The force that pulls things together'
            },
            {
              title: 'Stars',
              description: 'Giant balls of hot gas in space'
            },
            {
              title: 'Event Horizon',
              description: 'The point of no return around a black hole'
            }
          ],
          citations: [
            {
              source: 'Wikipedia - Black Hole (Simple English)',
              url: 'https://simple.wikipedia.org/wiki/Black_hole',
              excerpt: 'A black hole is a place in space where gravity pulls so much that even light cannot get out.'
            }
          ],
          followUpQuestions: [
            'What happens if you fall into a black hole?',
            'Can black holes die?',
            'Where is the closest black hole to Earth?',
            'How do scientists find black holes if they\'re invisible?'
          ]
        }
      },
      'layperson': {
        type: 'explain-o-matic',
        props: {
          topic: 'Black Holes',
          knowledgeLevel: 'layperson',
          explanation: `Black holes are regions of spacetime where gravity is so strong that nothing, not even light, can escape once it crosses the event horizon. They form when massive stars (typically >25 solar masses) undergo gravitational collapse at the end of their lives, compressing their mass into an infinitely small point called a singularity.

The event horizon marks the boundary beyond which escape is impossible. For a non-rotating black hole, this radius is given by the Schwarzschild radius: r = 2GM/c², where G is the gravitational constant, M is the mass, and c is the speed of light. Rotating black holes (Kerr black holes) have more complex geometries with inner and outer event horizons.

Black holes are classified by mass: stellar-mass (3-100 solar masses), intermediate-mass (100-100,000 solar masses), and supermassive (millions to billions of solar masses). Supermassive black holes exist at the centers of most galaxies, including our Milky Way. Despite being invisible, black holes can be detected through their gravitational effects on nearby matter, X-ray emissions from accretion disks, and gravitational waves from mergers. In 2019, the Event Horizon Telescope captured the first direct image of a black hole's shadow in the galaxy M87.`,
          relatedTopics: [
            {
              title: 'Event Horizon',
              description: 'The boundary of no return around a black hole'
            },
            {
              title: 'Hawking Radiation',
              description: 'Theoretical radiation that causes black holes to evaporate'
            },
            {
              title: 'Gravitational Waves',
              description: 'Ripples in spacetime from black hole mergers'
            },
            {
              title: 'Accretion Disks',
              description: 'Matter spiraling into black holes'
            }
          ],
          citations: [
            {
              source: 'Wikipedia - Black Hole',
              url: 'https://en.wikipedia.org/wiki/Black_hole',
              excerpt: 'A black hole is a region of spacetime where gravity is so strong that nothing can escape from it.'
            },
            {
              source: 'Wikipedia - Event Horizon',
              url: 'https://en.wikipedia.org/wiki/Event_horizon',
              excerpt: 'The event horizon is the boundary beyond which events cannot affect an outside observer.'
            },
            {
              source: 'Wikipedia - Gravitational Wave',
              url: 'https://en.wikipedia.org/wiki/Gravitational_wave',
              excerpt: 'Gravitational waves are ripples in spacetime caused by accelerating masses.'
            }
          ],
          followUpQuestions: [
            'What is the information paradox?',
            'How do black holes affect time?',
            'Can anything escape from a black hole?',
            'What happens at the singularity?',
            'How do supermassive black holes form?'
          ]
        }
      }
    }
  };

  // Get current topic specs for both levels
  const currentSpecs = sampleData[selectedTopic];

  // Create multi-level spec for DynamicUIRenderer
  const multiLevelSpec: ExplainOMaticSpec = {
    type: 'explain-o-matic',
    props: {
      topic: currentSpecs['layperson'].props.topic,
      levels: {
        'kid': {
          explanation: currentSpecs['kid'].props.explanation!,
          relatedTopics: currentSpecs['kid'].props.relatedTopics,
          citations: currentSpecs['kid'].props.citations,
          followUpQuestions: currentSpecs['kid'].props.followUpQuestions
        },
        'layperson': {
          explanation: currentSpecs['layperson'].props.explanation!,
          relatedTopics: currentSpecs['layperson'].props.relatedTopics,
          citations: currentSpecs['layperson'].props.citations,
          followUpQuestions: currentSpecs['layperson'].props.followUpQuestions
        }
      }
    }
  };

  const handleSetQuestion = (question: string) => {
    setQueryInput(question);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-dark)] p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-pixel text-[var(--color-primary)] glow-text uppercase tracking-wider">
            Explain-O-Matic Test Page
          </h1>
          <p className="text-gray-400 font-pixel text-sm">
            Testing multi-level explanations with localStorage persistence
          </p>
        </div>

        {/* Topic Selector */}
        <div className="bg-[var(--color-bg-card)] border-2 border-[var(--color-primary)] rounded-lg p-6 pixel-border">
          <h2 className="text-xl font-pixel text-[var(--color-secondary)] mb-4 uppercase">
            Select Topic
          </h2>
          <div className="flex gap-4">
            <button
              onClick={() => setSelectedTopic('quantum-entanglement')}
              className={`px-6 py-3 rounded-lg font-pixel text-sm transition-all ${
                selectedTopic === 'quantum-entanglement'
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--color-bg-dark)] text-gray-400 hover:bg-[var(--color-primary)]/20'
              }`}
            >
              Quantum Entanglement
            </button>
            <button
              onClick={() => setSelectedTopic('black-holes')}
              className={`px-6 py-3 rounded-lg font-pixel text-sm transition-all ${
                selectedTopic === 'black-holes'
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--color-bg-dark)] text-gray-400 hover:bg-[var(--color-primary)]/20'
              }`}
            >
              Black Holes
            </button>
          </div>
        </div>

        {/* Query Bar (simulated) */}
        <div className="bg-[var(--color-bg-card)] border-2 border-[var(--color-accent)] rounded-lg p-6 pixel-border">
          <h2 className="text-xl font-pixel text-[var(--color-accent)] mb-4 uppercase">
            Query Bar (Simulated)
          </h2>
          <input
            type="text"
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            placeholder="Click related topics or follow-up questions to populate..."
            className="w-full px-4 py-3 bg-[var(--color-bg-dark)] border-2 border-[var(--color-accent)]/30 rounded-lg text-white font-pixel text-sm focus:border-[var(--color-accent)] focus:outline-none"
          />
        </div>

        {/* localStorage Status */}
        {isClient && (
          <div className="bg-[var(--color-bg-card)] border-2 border-[var(--color-purple)] rounded-lg p-6 pixel-border">
            <h2 className="text-xl font-pixel text-[var(--color-purple)] mb-4 uppercase">
              localStorage Status
            </h2>
            <p className="font-pixel text-sm text-gray-300">
              Current saved level: <span className="text-[var(--color-purple)]">{storageValue}</span>
            </p>
            <p className="font-pixel text-xs text-gray-500 mt-2">
              Change the knowledge level below and refresh the page to see persistence in action
            </p>
          </div>
        )}

        {/* Explain-O-Matic Component */}
        <DynamicUIRenderer
          components={[multiLevelSpec]}
          onSetQuestion={handleSetQuestion}
        />

        {/* Testing Notes */}
        <div className="bg-[var(--color-bg-card)] border-2 border-[var(--color-secondary)] rounded-lg p-6 pixel-border">
          <h2 className="text-xl font-pixel text-[var(--color-secondary)] mb-4 uppercase">
            Testing Checklist
          </h2>
          <ul className="space-y-2 font-pixel text-sm text-gray-300">
            <li>✓ Switch between Kid Mode and Layperson levels</li>
            <li>✓ Click related topics to populate query bar</li>
            <li>✓ Click follow-up questions to populate query bar</li>
            <li>✓ Change level and refresh page to test localStorage persistence</li>
            <li>✓ Switch topics to see different content</li>
            <li>✓ Verify citations display correctly (with and without URLs)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// Made with Bob