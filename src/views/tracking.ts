import { ITrackingDataObj } from "../shortener/types/interface";

export const trackingSnippetHTML = (trackingData: ITrackingDataObj) => {
  const { id, long_url } = trackingData;
  return `<html>
            <head>
                <script>
                    window.onload = function() {
                        const startTime = new Date().getTime();
                        window.onbeforeunload = function() {
                            const endTime = new Date().getTime();
                            const timeSpent = Math.round((endTime - startTime) / 1000);

                            navigator.sendBeacon('/time-spent', JSON.stringify({
                                click_tracking_id: ${id},
                                time_spent: timeSpent
                            }));
                        };
                    };
                </script>
            </head>
            <body>
                Redirecting to the original page...
                <script>
                        window.location.href = '${long_url}';
                </script>
            </body>
        </html>
`;
};
