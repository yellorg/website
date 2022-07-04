import classnames from 'classnames';
import * as React from 'react';

export interface SimplePaginationProps {
    page: number;
    limit: number;
    nextPageExists: boolean;
    mainBlockClassName?: string;
    handleClickNextButton: (value: number) => void;
    handleClickPrevButton: (value: number) => void;
    total: number;
    shouldRenderTotal: boolean;
    prefixedTextLabel?: string;
    separatorText?: string;
    totalSeparatorText?: string;
    resultsText?: string;
    totalValue?: number;
    previousButtonLabel?: string;
    nextButtonLabel?: string;
    textLabelClassName?: string;
    buttonsAdditionalClassName?: string;
}

export const SimplePagination: React.FC<SimplePaginationProps> = ({
    page,
    limit,
    nextPageExists,
    mainBlockClassName,
    handleClickNextButton,
    handleClickPrevButton,
    total,
    shouldRenderTotal,
    prefixedTextLabel,
    separatorText,
    totalSeparatorText,
    resultsText,
    totalValue,
    previousButtonLabel,
    nextButtonLabel,
    textLabelClassName,
    buttonsAdditionalClassName,
}) => {
    const fromValue = React.useMemo(() => {
        return (page - 1) * limit + 1;
    }, [page, limit]);

    const toValue = React.useMemo(() => {
        return (page - 1) * limit + total;
    }, [page, limit, total]);

    const renderFromToNode = React.useMemo(() => {
        return (
            <>
                {prefixedTextLabel} <span className="font-bold">{fromValue}</span> {separatorText} <span className="font-bold">{toValue}</span>
            </>
        );
    }, [prefixedTextLabel, fromValue, separatorText, toValue]);

    const renderOfTotal = React.useMemo(() => {
        if (shouldRenderTotal) {
            return (
                <>
                    {totalSeparatorText} <span className="font-bold">{totalValue}</span> {resultsText}
                </>
            );
        }

        return null
    }, [shouldRenderTotal, totalValue, totalSeparatorText, resultsText]);

    const renderPreviousButton = React.useMemo(() => {
        return (
            <button
                className={classnames("relative inline-flex items-center py-2 px-4 border leading-5 rounded-md cursor-pointer bg-body-background-color border-neutral-control-color-70 transition-all ease-in-out duration-200 disabled:hover:cursor-not-allowed enabled:hover:bg-neutral-control-color-30", buttonsAdditionalClassName, page === 1 && "hidden")}
                onClick={() => handleClickPrevButton(page)}
                disabled={page === 1}
            >
                {previousButtonLabel}
            </button>
        );
    }, [page, previousButtonLabel]);

    const renderNextButton = React.useMemo(() => {
        return (
            <button
                className={classnames("ml-3 relative inline-flex items-center py-2 px-4 border leading-5 rounded-md cursor-pointer bg-body-background-color border-neutral-control-color-70 transition-all ease-in-out duration-200 disabled:hover:cursor-not-allowed enabled:hover:bg-neutral-control-color-30", buttonsAdditionalClassName, !nextPageExists && "hidden")}
                onClick={() => handleClickNextButton(page)}
                disabled={!nextPageExists}
            >
                {nextButtonLabel}
            </button>
        );
    }, [page, nextPageExists, nextButtonLabel]);

    return (
        <nav className={mainBlockClassName} aria-label="Pagination">
            <div className="block">
                <p className={textLabelClassName}>
                    {renderFromToNode} {renderOfTotal}
                </p>
            </div>
            <div className="flex justify-between">
                {renderPreviousButton}
                {renderNextButton}
            </div>
        </nav>
    );
};

SimplePagination.defaultProps = {
    page: 1,
    limit: 10,
    nextPageExists: true,
    mainBlockClassName: 'bg-neutral-control-color-0 pt-5 pb-2 px-1 flex items-center justify-between border-t border-divider-color-40 sticky bottom-0 z-[10]',
    total: 10,
    shouldRenderTotal: true,
    prefixedTextLabel: 'Showing',
    separatorText: 'to',
    totalSeparatorText: 'of',
    resultsText: 'results',
    previousButtonLabel: 'Previous',
    nextButtonLabel: 'Next',
    textLabelClassName: 'm-0',
};
