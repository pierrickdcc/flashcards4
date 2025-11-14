
import { useState, Fragment } from 'react';
import { Combobox, Transition } from '@headlessui/react';
import { Check, ChevronsUpDown } from 'lucide-react';

const SubjectCombobox = ({ subjects, selectedSubject, setSelectedSubject }) => {
  const [query, setQuery] = useState('');

  const filteredSubjects =
    query === ''
      ? subjects
      : subjects.filter((subject) =>
          subject.name
            .toLowerCase()
            .replace(/\s+/g, '')
            .includes(query.toLowerCase().replace(/\s+/g, ''))
        );

  const showCreateOption = query !== '' && !subjects.some(s => s.name.toLowerCase() === query.toLowerCase());

  return (
    <div className="relative">
      <Combobox value={selectedSubject} onChange={setSelectedSubject} nullable>
        <div className="relative">
          <Combobox.Input
            className="input w-full"
            displayValue={(subject) => subject?.name || ''}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Matière (ex: Anatomie)"
          />
          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronsUpDown
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </Combobox.Button>
        </div>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          afterLeave={() => setQuery('')}
        >
          <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-card py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {filteredSubjects.length === 0 && query !== '' && !showCreateOption ? (
              <div className="relative cursor-default select-none py-2 px-4 text-muted-foreground">
                Aucune matière trouvée.
              </div>
            ) : (
              filteredSubjects.map((subject) => (
                <Combobox.Option
                  key={subject.id}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                      active ? 'bg-primary/10 text-primary-foreground' : 'text-card-foreground'
                    }`
                  }
                  value={subject}
                >
                  {({ selected, active }) => (
                    <>
                      <span
                        className={`block truncate ${
                          selected ? 'font-medium' : 'font-normal'
                        }`}
                      >
                        {subject.name}
                      </span>
                      {selected ? (
                        <span
                          className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                            active ? 'text-primary-foreground' : 'text-primary'
                          }`}
                        >
                          <Check className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Combobox.Option>
              ))
            )}
            {showCreateOption && (
                 <Combobox.Option
                    value={{ id: null, name: query }}
                    className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                      active ? 'bg-primary/10 text-primary-foreground' : 'text-card-foreground'
                    }`
                  }
                 >
                    Créer "{query}"
                </Combobox.Option>
            )}
          </Combobox.Options>
        </Transition>
      </Combobox>
    </div>
  );
};

export default SubjectCombobox;
