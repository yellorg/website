import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PrismicRichText } from '@prismicio/react';
import classNames from 'classnames';
import HtmlSerializer from '../../../helpers/HtmlSerializer';

interface DuckiesFAQProps {
    faqList: any
}

export const DuckiesFAQ = ({ faqList }: DuckiesFAQProps) => {
    const [selectedQuestionIndex, setSelectedQuestionIndex] = React.useState<number>(-1);

    const handleQuestionClick = React.useCallback(
        (index: number) => {
            if (selectedQuestionIndex < index && selectedQuestionIndex != -1) {
                const position = window.pageYOffset - (document.getElementById(`faq-${selectedQuestionIndex}`)?.clientHeight || 0) - 1;
                window.scrollTo(0, position);
            }
            setSelectedQuestionIndex(
                selectedQuestionIndex == index ? -1 : index
            );
        },
        [selectedQuestionIndex]
    );

    const renderFAQList = React.useMemo(() => {
        if (!faqList?.data?.slices?.length || !faqList.data.slices[0].items) {
            return <></>;
        }

        return faqList.data.slices[0].items.map((item: any, index: number) => {
            const isSelected = selectedQuestionIndex == index;
            const questionClassName = classNames(
                'p-4 cursor-pointer',
                {
                    'bg-primary-cta-color-60 lg:hover:bg-primary-cta-color-80 rounded delay-200': !isSelected,
                    'bg-body-background-color lg:hover:bg-neutral-control-color-20 border-b border-divider-color-40 rounded-t': isSelected,
                },
            );

            const answerClassName = classNames(
                'overflow-hidden transition-[max-height] transform duration-300 bg-body-background-color rounded-b',
                {
                    'max-h-0 ease-out': !isSelected,
                    'max-h-[131.25rem] ease-in': isSelected,
                },
            );

            const caretClassName = classNames(
                'transition duration-300 w-[40px]',
                {
                    'rotate-180': isSelected,
                }
            );

            return (
                <div key={`faq-${index}`} className="group w-full border border-text-color-100 rounded">
                    <div className={questionClassName} onClick={() => { handleQuestionClick(index) }}>
                        <div className="w-full flex gap-[0.75rem] items-center">
                            <svg className={caretClassName} width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" clipRule="evenodd" d="M10.5858 14.5858C11.3668 13.8047 12.6332 13.8047 13.4142 14.5858L20 21.1716L26.5858 14.5858C27.3668 13.8047 28.6332 13.8047 29.4142 14.5858C30.1953 15.3668 30.1953 16.6332 29.4142 17.4142L21.4142 25.4142C20.6332 26.1953 19.3668 26.1953 18.5858 25.4142L10.5858 17.4142C9.80474 16.6332 9.80474 15.3668 10.5858 14.5858Z" fill="#070707"/>
                            </svg>
                            <span className="text-xl text-text-color-100 font-metro-semibold w-[calc(100%-2.5rem)]">
                                {item.question}
                            </span>
                        </div>
                    </div>
                    <div className={answerClassName} id={`faq-${index}`}>
                        <div className="px-6 pt-4 pb-6">
                            <PrismicRichText field={item.answer} components={HtmlSerializer} />
                        </div>
                    </div>
                </div>
            )
        });
    }, [faqList, selectedQuestionIndex]);

    const renderRiddlerDuck = React.useMemo(
        () => (
            <div className="basis-full w-full sticky top-[3.875rem]">
                <div className="flex items-center justify-center">
                    <div className="absolute z-[10]">
                        <Image
                            src="/images/components/duckies/duckRiddler.png"
                            layout="intrinsic"
                            width={300}
                            height={300}
                        />
                    </div>
                    <div>
                        <Image
                            src="/images/components/duckies/duckRiddler_back.png"
                            layout="intrinsic"
                            width={500}
                            height={500}
                        />
                    </div>
                </div>
            </div>
        ),
        []
    );

    return (
        <div id="faq" className="flex flex-col lg:flex-row mx-auto pt-[5.25rem] lg:pt-[6.25rem] px-3.5 max-w-md-layout 2xl:max-w-lg-layout">
            <div className="basis-1/3 hidden lg:block">
                {renderRiddlerDuck}
            </div>
            <div className="w-full lg:w-[calc(66%+3.125rem)] lg:-ml-[3.125rem] z-[10]">
                <div className="flex flex-col gap-[0.75rem]">
                    <div className="block w-fit bg-primary-cta-color-90 text-primary-cta-layer-color-60 py-1 px-3.5 font-metro-bold rounded-sm">
                        ASK OUR DUCK-RIDDLER
                    </div>
                    <div className="text-6xl text-text-color-100 font-gilmer-bold text-left">
                        Frequently asked questions
                    </div>
                    <div className="text-xl text-text-color-100 font-metro-semibold text-left inline">
                        Can’t find it here? Check out our{' '}
                        <Link href="https://t.me/yellow_org">
                            <a target="_blank" className="group text-text-color-100 hover:text-text-color-100 prevent-default">
                                <span className="underline">
                                    telegram channel
                                </span>
                                {' '}
                                <svg className="inline group-hover:translate-x-1 duration-300 mb-[0.219rem]" width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M8.26341 0.963555C8.61488 0.612083 9.18473 0.612083 9.5362 0.963555L14.9362 6.36356C15.2877 6.71503 15.2877 7.28488 14.9362 7.63635L9.5362 13.0363C9.18473 13.3878 8.61488 13.3878 8.26341 13.0363C7.91194 12.6849 7.91194 12.115 8.26341 11.7636L12.127 7.89995L1.69981 7.89995C1.20275 7.89995 0.799805 7.49701 0.799805 6.99995C0.799805 6.50289 1.20275 6.09995 1.69981 6.09995H12.127L8.26341 2.23635C7.91194 1.88488 7.91194 1.31503 8.26341 0.963555Z" fill="#070707"/>
                                </svg>
                            </a>
                        </Link>
                    </div>
                </div>
                <div className="w-full lg:hidden mt-9">
                    {renderRiddlerDuck}
                </div>
                <div className="flex flex-col mt-12 gap-4">
                    {renderFAQList}
                </div>
            </div>
        </div>
    );
};
