import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PrismicRichText } from '@prismicio/react';
import classNames from 'classnames';

interface DuckiesFAQProps {
    faqList: any
}

export const DuckiesFAQ = ({ faqList }: DuckiesFAQProps) => {
    const [selectedQuestionIndex, setSelectedQuestionIndex] = React.useState<number>(-1);

    const renderFAQList = React.useMemo(() => {
        if (!faqList?.data?.slices?.length || !faqList.data.slices[0].items) {
            return <></>;
        }

        return faqList.data.slices[0].items.map((item: any, index: number) => {
            const isSelected = selectedQuestionIndex == index;
            const questionClassName = classNames(
                'p-[16px] cursor-pointer',
                {
                    'bg-primary-cta-color-60 lg:hover:bg-primary-cta-color-80 rounded delay-200': !isSelected,
                    'bg-body-background-color lg:hover:bg-neutral-control-color-20 border-b border-divider-color-40 rounded-t': isSelected,
                },
            );

            const answerClassName = classNames(
                'overflow-hidden transition-[max-height] transform duration-300 bg-body-background-color rounded-b',
                {
                    'max-h-0 ease-out': !isSelected,
                    'max-h-[500px] ease-in': isSelected,
                },
            );

            const caretClassName = classNames(
                'transition duration-300',
                {
                    'rotate-180': isSelected,
                }
            );

            return (
                <div key={`faq-${index}`} className="group w-full border border-text-color-100 rounded" onClick={() => { setSelectedQuestionIndex(isSelected ? -1 : index) }}>
                    <div className={questionClassName}>
                        <div className="w-full flex gap-[12px] items-center">
                            <svg className={caretClassName} width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M10.5858 14.5858C11.3668 13.8047 12.6332 13.8047 13.4142 14.5858L20 21.1716L26.5858 14.5858C27.3668 13.8047 28.6332 13.8047 29.4142 14.5858C30.1953 15.3668 30.1953 16.6332 29.4142 17.4142L21.4142 25.4142C20.6332 26.1953 19.3668 26.1953 18.5858 25.4142L10.5858 17.4142C9.80474 16.6332 9.80474 15.3668 10.5858 14.5858Z" fill="#070707"/>
                            </svg>
                            <span className="text-[20px] leading-[28px] text-text-color-100 font-metro-semibold">
                                {item.question}
                            </span>
                        </div>
                    </div>
                    <div className={answerClassName}>
                        <div className="px-[24px] pt-[16px] pb-[24px]">
                            <PrismicRichText field={item.answer} />
                        </div>
                    </div>
                </div>
            )
        });
    }, [faqList, selectedQuestionIndex]);

    const renderRiddlerDuck = React.useMemo(
        () => (
            <div className="basis-full w-full sticky top-[62px]">
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
        <div className="flex flex-col lg:flex-row mx-auto pt-[84px] lg:pt-[100px] px-[14px] max-w-md-layout 2xl:max-w-lg-layout">
            <div className="basis-1/3 hidden lg:block">
                {renderRiddlerDuck}
            </div>
            <div className="w-full lg:w-[calc(66%+50px)] lg:-ml-[50px] z-[10]">
                <div className="flex flex-col gap-[12px]">
                    <div className="block w-fit bg-primary-cta-color-90 text-primary-cta-layer-color-60 py-[4px] px-[14px] font-metro-bold rounded-sm">
                        ASK OUR DUCK-RIDDLER
                    </div>
                    <div className="text-[60px] leading-[64px] text-text-color-100 font-gilmer-bold text-left">
                        Frequently asked questions
                    </div>
                    <div className="text-[20px] leading-[28px] text-text-color-100 font-metro-semibold text-left inline">
                        Can’t find it here? Check out our{' '}
                        <Link href="https://t.me/yellow_org">
                            <a className="group text-text-color-100 hover:text-text-color-100 prevent-default">
                                <span className="underline">
                                    telegram channel
                                </span>
                                {' '}
                                <svg className="inline group-hover:translate-x-1 duration-300 mb-[3.5px]" width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M8.26341 0.963555C8.61488 0.612083 9.18473 0.612083 9.5362 0.963555L14.9362 6.36356C15.2877 6.71503 15.2877 7.28488 14.9362 7.63635L9.5362 13.0363C9.18473 13.3878 8.61488 13.3878 8.26341 13.0363C7.91194 12.6849 7.91194 12.115 8.26341 11.7636L12.127 7.89995L1.69981 7.89995C1.20275 7.89995 0.799805 7.49701 0.799805 6.99995C0.799805 6.50289 1.20275 6.09995 1.69981 6.09995H12.127L8.26341 2.23635C7.91194 1.88488 7.91194 1.31503 8.26341 0.963555Z" fill="#070707"/>
                                </svg>
                            </a>
                        </Link>
                    </div>
                </div>
                <div className="w-full lg:hidden mt-[36px]">
                    {renderRiddlerDuck}
                </div>
                <div className="flex flex-col mt-[48px] gap-[16px]">
                    {renderFAQList}
                </div>
            </div>
        </div>
    );
};
