import React, { FC } from 'react';
import { DuckiesHero} from '../DuckiesHero';
import { DuckiesAffiliates} from '../DuckiesAffiliates';
import { DuckiesEarnMore} from '../DuckiesEarnMore';
import { DuckiesRedeem} from '../DuckiesRedeem';
import { dispatchAlert } from '../../../features/alerts/alertsSlice';
import { useAppDispatch } from '../../../app/hooks';
import { DuckiesFAQ } from '../DuckiesFAQ';
import { supabase } from '../../../lib/SupabaseConnector';
import { useRouter } from 'next/router';
import useSocialConnections from '../../../hooks/useSocialConnections';
import { MetamaskConnectModal } from '../Modals/MetamaskConnectModal';
import { SocialAuthModal } from '../Modals/SocialAuthModal';
import { ClaimRewardModal } from '../Modals/ClaimRewardModal';
import useMetaMask from '../../../hooks/useMetaMask';
import { useEagerConnect } from '../../../hooks/useEagerConnect';
import useWallet from '../../../hooks/useWallet';
import { DuckiesPrizes } from '../DuckiesPrizes'
import { DuckiesPrizesList } from '../DuckiesPrizes/defaults';
import { DuckiesBanned } from '../DuckiesBanned';
import useBounties from '../../../hooks/useBounties';

interface DuckiesLayoutProps {
    bounties: any;
    faqList: any;
}

export const DuckiesLayout: FC<DuckiesLayoutProps> = ({ bounties, faqList }: DuckiesLayoutProps): JSX.Element => {
    const [isOpenModal, setIsOpenModal] = React.useState<boolean>(false);
    const [currentModal, setCurrentModal] = React.useState<string>('');
    const { items } = bounties?.data.slices[0];

    const { supportedChain } = useMetaMask();
    const triedToEagerConnect = useEagerConnect();
    const { active, account } = useWallet();

    const isReady = React.useMemo(() => {
        return supportedChain && triedToEagerConnect && active && account;
    }, [supportedChain, triedToEagerConnect, active, account]);

    const [user, setUser] = React.useState<any>(null);

    const dispatch = useAppDispatch();
    const router = useRouter();
    const query = router.query;
    const supabaseUser = supabase.auth.user();

    useSocialConnections(user);

    React.useEffect(() => {
        if (query.error) {
            dispatch(dispatchAlert({
                type: 'error',
                title: 'Server error',
                message: query.error_description?.toString() || '',
            }));
        }
        router.replace('/duckies');
    }, []);

    React.useEffect(() => {
        if (supabaseUser && !user) {
            setUser(supabaseUser);
        }

        if (!supabaseUser && user) {
            setUser(null);
        }
    }, [supabaseUser, user]);

    React.useEffect(() => {
        if ((isReady && currentModal === 'metamask') || (supabaseUser && currentModal === 'social_auth')) {
            handleCloseModal();
        }
    }, [isReady, supabaseUser]);

    const handleOpenModal = React.useCallback(() => {
        setIsOpenModal(true);

        if (!isReady) {
            setCurrentModal('metamask');
            return;
        }

        if (!supabaseUser) {
            setCurrentModal('social_auth');
            return;
        }

        setCurrentModal('rewards');
    }, [isReady, supabaseUser]);

    const handleOpenMetamaskModal = React.useCallback(() => {
        setIsOpenModal(true);
        if (!isReady) {
            setCurrentModal('metamask');
        } else {
            handleCloseModal();
        }
    }, []);

    const handleCloseModal = React.useCallback(() => {
        setIsOpenModal(false);
        setCurrentModal('');
    }, []);

    const renderContent = React.useMemo(() => {
        if (user?.state !== 'banned') {
            return (
                <div className="bg-primary-cta-color-60 pb-[5rem] md:pb-[7.5rem]">
                    <DuckiesHero
                        bountiesItems={items}
                        supabaseUser={user}
                        handleOpenModal={handleOpenModal}
                    />
                    <DuckiesAffiliates
                        bountyTitle={bounties.data.title}
                        bountiesItems={items}
                        supabaseUser={user}
                        handleOpenModal={handleOpenModal}
                    />
                    <DuckiesEarnMore
                        handleOpenModal={handleOpenMetamaskModal}
                    />
                    <DuckiesRedeem />
                    <DuckiesPrizes prizes={DuckiesPrizesList} />
                    <DuckiesFAQ
                        faqList={faqList}
                    />
                    <MetamaskConnectModal
                        isOpenModal={isOpenModal && currentModal === 'metamask'}
                        setIsOpenModal={handleCloseModal}
                    />
                    <SocialAuthModal
                        isOpenModal={isOpenModal && currentModal === 'social_auth'}
                        setIsOpenModal={handleCloseModal}
                    />
                    <ClaimRewardModal
                        bounties={items}
                        isOpenModal={isOpenModal && currentModal !== 'metamask' && currentModal !== 'social_auth'}
                        setIsOpenModal={handleCloseModal}
                    />
                </div>
            );
        } else {
             return <DuckiesBanned/>
        }
    },[user, items, handleCloseModal, currentModal, isOpenModal, DuckiesPrizesList, faqList])

    return (
        <main className="bg-primary-cta-color-60 pb-[5rem] md:pb-[7.5rem]">
            {renderContent}
        </main>
    );
};
